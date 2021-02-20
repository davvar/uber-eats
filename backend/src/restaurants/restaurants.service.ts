import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import { ILike } from 'typeorm';
import {
  AllCategoriesOutput,
  CategoryInput,
  CategoryOutput,
  CreateRestaurantInput,
  DeleteRestaurantInput,
  EditRestaurantInput
} from './dtos';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: RestaurantRepository,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
  ) {}

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const newRestaurant = this.restaurants.create(input);

      newRestaurant.category = await this.categories.getOrCreate(
        input.categoryName,
      );
      newRestaurant.owner = owner;
      await this.restaurants.save(newRestaurant);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create a restaurant' };
    }
  }

  async editRestaurant(
    owner: User,
    input: EditRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const errorMsg = await this.canModifyRestaurant(input.id, owner.id);
      if (errorMsg) {
        return { ok: false, error: errorMsg };
      }

      let category: Category = null;
      if (input.categoryName) {
        category = await this.categories.getOrCreate(input.categoryName);
      }

      await this.restaurants.save([
        {
          id: input.id,
          ...input,
          ...(category && { category }), // { ...null } is {  }
        },
      ]);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not edit a restaurant' };
    }
  }

  async deleteRestaurant(
    owner: User,
    { id }: DeleteRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const errorMsg = await this.canModifyRestaurant(id, owner.id);
      if (errorMsg) {
        return { ok: false, error: errorMsg };
      }

      await this.restaurants.delete(id);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete a restaurant' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      return { ok: true, categories: await this.categories.find() };
    } catch (error) {
      return { ok: false, error: 'Could not load categories' };
    }
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return { ok: false, error: 'Category not found' };
      }

      const { restaurants, ...counts} = await this.restaurants.findWithPagination(page, {
        where: { category },
      });

      category.restaurants = restaurants;

      return { ok: true, category, ...counts };
    } catch (error) {
      return { ok: false, error: 'Could not load category' };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const data = await this.restaurants.findWithPagination(page);

      return { ok: true, ...data };
    } catch (error) {
      return { ok: false, error: 'Could not load restaurants' };
    }
  }

  countRestaurants(category: Category): Promise<number> {
    return this.restaurants.count(category);
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(restaurantId);
      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: 'Restaurant not found' };
    }
  }

  async searchRestaurantByName({
    page,
    query,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const data = await this.restaurants.findWithPagination(page, {
        where: { name: ILike(`%${query}%`) },
      });

      return { ok: true, ...data };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not search for restaurants' };
    }
  }

  private async canModifyRestaurant(
    restaurantId: Restaurant['id'],
    ownerId: User['id'],
  ): Promise<string | void> {
    const restaurant = await this.restaurants.findOne(restaurantId, {
      loadRelationIds: true,
    });

    if (!restaurant) {
      return 'Could not find restaurant';
    }

    if (restaurant.ownerId !== ownerId) {
      return "You can't delete a restaurant that you don't own";
    }
  }
}
