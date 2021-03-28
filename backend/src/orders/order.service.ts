import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem, OrderItemOption } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderItem) private orderItem: Repository<OrderItem>,
    @InjectRepository(Restaurant) private restaurants: RestaurantRepository,
    @InjectRepository(Dish) private dishes: Repository<Dish>,
  ) {}

  async createOrder(
    customer: User,
    { items, restaurantId }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Restaurant not found' };
      }

      const order = this.orders.create({
        customer,
        restaurant,
        total: 0,
      });

      const orderItemsPromises: Promise<OrderItem>[] = [];
      for (const { dishId, options } of items) {
        const dish = await this.dishes.findOne(dishId);
        if (!dish) {
          return { ok: false, error: 'Dish not found' };
        }

        dish.price += this.calculatePriceOfDishOptions(dish, options);
        order.total += dish.price;

        orderItemsPromises.push(
          this.orderItem.save(this.orderItem.create({ dish, options })),
        );
      }

      order.items = await Promise.all(orderItemsPromises);
      await this.orders.save(order);

      return { ok: true };
    } catch (error) {
      console.log({ error });
      return { ok: false, error: 'Could not create order' };
    }
  }

  private calculatePriceOfDishOptions(
    dish: Dish,
    options: OrderItemOption[] = [],
  ): number {
    return options.reduce((total, { name, choice }) => {
      const dishOption = dish.options.find(o => o.name === name);

      if (!dishOption) {
        return total;
      }

      if (dishOption?.extra) {
        total += dishOption.extra;
      }

      const dishOptionChoice = dishOption.choices.find(
        dishChoice => dishChoice.name === choice,
      );

      if (dishOptionChoice?.extra) {
        total += dishOptionChoice.extra;
      }

      return total;
    }, 0);
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];

      if (user.role === UserRole.CLIENT) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.DELIVERY) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.OWNER) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });

        orders = restaurants.flatMap(r => r.orders);
        if (status) {
          orders = orders.filter(o => o.status === status);
        }
      }

      return { ok: true, orders };
    } catch (error) {
      return { ok: false, error: 'Could not found orders' };
    }
  }

  async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {
        relations: ['restaurant'],
      });
      if (!order) {
        return { ok: false, error: 'Could not find order' };
      }

      if (this.canSeeOrder(order, user)) {
        return { ok: false, error: "You can't see that." };
      }

      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: 'Could not find order' };
    }
  }

  async editOrder(
    user: User,
    { id, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {
        relations: ['restaurant'],
      });
      if (!order) {
        return { ok: false, error: 'Could not find order' };
      }

      if (this.canSeeOrder(order, user)) {
        return { ok: false, error: "You can't see that." };
      }

      if (this.canEditOrder(user, status)) {
        await this.orders.save([{ id, status }]);
        return { ok: true };
      } else return { ok: false, error: "You can't edit order" };
    } catch (error) {
      return { ok: false, error: 'Could not edit order' };
    }
  }

  private canEditOrder(user: User, status: OrderStatus) {
    let canEdit = true;
    if (user.role === UserRole.CLIENT) {
      canEdit = false;
    }

    if (
      user.role === UserRole.OWNER &&
      status !== OrderStatus.Cooking &&
      status !== OrderStatus.Cooked
    ) {
      canEdit = false;
    }

    if (
      user.role === UserRole.DELIVERY &&
      status !== OrderStatus.PickedUp &&
      status !== OrderStatus.Delivered
    ) {
      canEdit = false;
    }

    return canEdit;
  }

  private canSeeOrder(order: Order, user: User) {
    return (
      order.customerId !== user.id &&
      order.driverId !== user.id &&
      order.restaurant.ownerId !== user.id
    );
  }
}
