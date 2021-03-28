import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(private ordersService: OrderService) {}

  @Mutation(() => CreateOrderOutput)
  @Role('CLIENT')
  createOrder(@AuthUser() customer: User, @Args('input') input: CreateOrderInput) {
    return this.ordersService.createOrder(customer, input);
  }

}