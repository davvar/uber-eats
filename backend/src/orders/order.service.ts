import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem, OrderItemOption } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

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
        total: 0
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
      await this.orders.save(order)

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
}
