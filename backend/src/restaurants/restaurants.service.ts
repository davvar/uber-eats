import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import {
  AllCategoriesOutput,
  CategoryInput,
  CategoryOutput,
  CreateRestaurantInput,
  DeleteRestaurantInput,
  EditRestaurantInput
} from './dtos';
import { CreateDishInput, CreateDishOutput } from './dtos/create.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) private restaurants: RestaurantRepository,
    @InjectRepository(Category) private categories: CategoryRepository,
    @InjectRepository(Dish) private dishes: Repository<Dish>,
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
      const res = await this.findRestaurantOfOwner(input.id, owner.id);
      if (res instanceof Error) {
        return { ok: false, error: res.message };
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
    { id: restaurantId }: DeleteRestaurantInput,
  ): Promise<CoreOutput> {
    try {
      const { error, restaurant } = await this.findRestaurantOfOwner(
        restaurantId,
        owner.id,
      );
      if (error) {
        return { ok: false, error };
      }

      await this.restaurants.delete(restaurantId);
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

      const {
        restaurants,
        ...counts
      } = await this.restaurants.findWithPagination(page, {
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
      const restaurant = await this.restaurants.findOneOrFail(restaurantId, {
        relations: ['menu'],
      });
      console.log({ restaurant });

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

  async createDish(
    owner: User,
    input: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const { error, restaurant } = await this.findRestaurantOfOwner(
        input.restaurantId,
        owner.id,
      );

      if (error) {
        return { ok: false, error };
      }

      const dish = await this.dishes.save(
        this.dishes.create({ ...input, restaurant }),
      );

      return { ok: true, dish };
    } catch (error) {
      return { ok: false, error: 'Could not create a dish' };
    }
  }

  async editDish(
    owner: User,
    { dishId, ...updates }: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Could not find dish' };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.dishes.save([{
        id: dishId,
        ...updates
      }])

      return { ok: true, dish };
    } catch (error) {
      return { ok: false, error: 'Could not edit a dish' };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });

      if (!dish) {
        return { ok: false, error: 'Could not find dish' };
      }

      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }

      await this.dishes.delete(dishId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Could not delete a dish' };
    }
  }

  private async findRestaurantOfOwner(
    restaurantId: Restaurant['id'],
    ownerId: User['id'],
  ): Promise<{ error?: string; restaurant?: Restaurant }> {
    const restaurant = await this.restaurants.findOne(restaurantId, {
      loadRelationIds: true,
    });

    if (!restaurant) {
      return { error: 'Restaurant not found' };
    }

    if (restaurant.ownerId !== ownerId) {
      return {
        error: "You can't delete a restaurant that you don't own",
      };
    }

    return { restaurant };
  }


}
