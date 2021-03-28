import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AllCategoriesOutput, CategoryInput, CategoryOutput } from './dtos';
import { Category } from './entities/category.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Category)
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
