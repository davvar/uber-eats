import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { Dish } from './entities/dish.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(_of => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(type => CreateDishOutput)
  @Role('OWNER')
  createDish(
    @AuthUser() owner: User,
    @Args('input') input: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, input);
  }

  @Mutation(type => EditDishOutput)
  @Role('OWNER')
  editDish(
    @AuthUser() owner: User,
    @Args('input') input: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, input);
  }

  @Mutation(type => DeleteDishOutput)
  @Role('OWNER')
  deleteDish(
    @AuthUser() owner: User,
    @Args('input') input: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, input);
  }
}
