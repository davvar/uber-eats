import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto, UpdateRestaurantDto } from './dtos';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(_of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(_returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(_returns => Boolean)
  async createRestaurant(
    @Args('data') data: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(data);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(_returns => Boolean)
  async updateRestaurant(@Args() data: UpdateRestaurantDto): Promise<boolean> {
    try {
      await this.restaurantService.updateRestaurant(data);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
