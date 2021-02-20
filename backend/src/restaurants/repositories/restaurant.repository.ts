import { EntityRepository, FindManyOptions, Repository } from "typeorm";
import { Restaurant } from '../entities/restaurant.entity';
const PAGE_SIZE = 25

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findWithPagination(
    page: number,
    options: FindManyOptions = {},
  ) {
    options.take = options.take || PAGE_SIZE
    options.skip = options.skip || (page - 1) * PAGE_SIZE

    const [restaurants, totalResults] = await this.findAndCount(options);

    return {
      restaurants,
      totalResults,
      totalPages: Math.ceil(totalResults / PAGE_SIZE),
    };
  }
}