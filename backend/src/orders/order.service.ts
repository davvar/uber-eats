import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(Restaurant) private restaurants: RestaurantRepository,
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



      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
        }),
      );
    } catch (error) {
      console.log({ error });
      return { ok: false, error: 'Could not create order' };
    }
  }
}
