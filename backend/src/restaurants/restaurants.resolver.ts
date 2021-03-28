import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { CoreOutput } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
  DeleteRestaurantInput,
  EditRestaurantInput,
  RestaurantInput,
  RestaurantOutput,
  RestaurantsInput,
  RestaurantsOutput,
  SearchRestaurantInput,
  SearchRestaurantOutput
} from './dtos';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(returns => CreateRestaurantOutput)
  @Role('OWNER')
  createRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(owner, input);
  }

  @Mutation(returns => CoreOutput)
  @Role('OWNER')
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: EditRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.editRestaurant(owner, input);
  }

  @Mutation(returns => CoreOutput)
  @Role('OWNER')
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: DeleteRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.deleteRestaurant(owner, input);
  }

  @Query(returns => RestaurantsOutput)
  restaurants(@Args('input') input: RestaurantsInput): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(input);
  }

  @Query(returns => RestaurantOutput)
  restaurant(@Args('input') input: RestaurantInput): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(input);
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurants(@Args('input') input: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(input);
  }

}
