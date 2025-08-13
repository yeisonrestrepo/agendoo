import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateReviewInput } from './dto/review.dto';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private reviewsService: ReviewsService) {}

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @CurrentUser() user: User,
    @Args('input') input: CreateReviewInput,
  ): Promise<Review> {
    if (user.role !== UserRole.CLIENT) {
      throw new Error('Only clients can create reviews');
    }

    return this.reviewsService.createReview(user.id, input);
  }

  @Query(() => [Review])
  async getReviewsByProfessional(
    @Args('professionalId') professionalId: string
  ): Promise<Review[]> {
    return this.reviewsService.getReviewsByProfessional(professionalId);
  }

  @Query(() => Review)
  async getReview(@Args('id') id: string): Promise<Review> {
    return this.reviewsService.getReviewById(id);
  }

  @Query(() => [Review])
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@CurrentUser() user: User): Promise<Review[]> {
    return this.reviewsService.getReviewsByClient(user.id);
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async canReview(
    @CurrentUser() user: User,
    @Args('bookingId') bookingId: string,
  ): Promise<boolean> {
    return this.reviewsService.canReview(user.id, bookingId);
  }

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @CurrentUser() user: User,
    @Args('reviewId') reviewId: string,
    @Args('input') input: CreateReviewInput,
  ): Promise<Review> {
    if (user.role !== UserRole.CLIENT) {
      throw new Error('Only clients can update reviews');
    }

    return this.reviewsService.updateReview(reviewId, user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteReview(
    @CurrentUser() user: User,
    @Args('reviewId') reviewId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.CLIENT) {
      throw new Error('Only clients can delete reviews');
    }

    return this.reviewsService.deleteReview(reviewId, user.id);
  }
}