import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(private ordersService: OrderService) {}

  @Mutation(() => CreateOrderOutput)
  @Role('CLIENT')
  createOrder(
    @AuthUser() customer: User,
    @Args('input') input: CreateOrderInput,
  ) {
    return this.ordersService.createOrder(customer, input);
  }

  @Query(returns => GetOrdersOutput)
  @Role('ANY')
  async getOrders(
    @AuthUser() user: User,
    @Args('input') input: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, input);
  }

  @Mutation(returns => EditOrderOutput)
  @Role('ANY')
  async editOrder(
    @AuthUser() user: User,
    @Args('input') input: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, input);
  }
}
