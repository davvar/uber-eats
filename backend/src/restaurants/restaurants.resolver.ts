import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurants-dto';
import { Restaurant } from './entities/restaurant.entity';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  @Query(returns => [Restaurant])
  restaurants(): Restaurant[] {
    return [];
  }

  @Mutation(returns => Restaurant)
  createRestaurant(
    @Args() { address, isVegan, name, ownersName }: CreateRestaurantDto,
  ): Restaurant {
    return { name };
  }

  @Mutation(returns => Boolean)
  deleteRestaurant(): number {
    return 4;
  }
}
