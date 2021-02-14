import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(input);
      const categoryName = input.categoryName.trim().toLowerCase()
      const categorySlug = categoryName.split(/ /g).filter(v => v).join('-');

      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }

      newRestaurant.category = category;
      newRestaurant.owner = owner;
      await this.restaurants.save(newRestaurant);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create a restaurant' };
    }
  }
}
