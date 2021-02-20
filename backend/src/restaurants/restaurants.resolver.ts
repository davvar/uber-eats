import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { CoreOutput } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import {
  AllCategoriesOutput,
  CategoryInput,
  CategoryOutput,
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
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(_of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(_returns => CreateRestaurantOutput)
  @Role('OWNER')
  createRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(owner, input);
  }

  @Mutation(_returns => CoreOutput)
  @Role('OWNER')
  editRestaurant(
    @AuthUser() owner: User,
    @Args('input') input: EditRestaurantInput,
  ): Promise<CoreOutput> {
    return this.restaurantService.editRestaurant(owner, input);
  }

  @Mutation(_returns => CoreOutput)
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


@Resolver(_of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(is => Number)
  restaurantsCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(@Args('input') input: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(input);
  }
}
