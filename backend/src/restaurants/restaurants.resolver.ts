import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurants-dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(_of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(_returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(_returns => Restaurant)
  createRestaurant(
    @Args() _data: CreateRestaurantDto,
  ): Restaurant {
    return;
  }

  @Mutation(_returns => Boolean)
  deleteRestaurant(): number {
    return 4;
  }
}
