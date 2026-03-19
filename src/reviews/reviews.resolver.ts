import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { CreateReviewInput } from './dto/review.dto';
import { DataloaderService } from '../common/dataloaders/dataloader.service';

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(
    private reviewsService: ReviewsService,
    private loaders: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async client(@Parent() review: Review): Promise<User> {
    if (review.client) return review.client;
    return this.loaders.usersById.load(review.clientId);
  }

  @ResolveField(() => Business)
  async business(@Parent() review: Review): Promise<Business> {
    if (review.business) return review.business;
    return this.loaders.businessesById.load(review.businessId);
  }

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async createReview(
    @CurrentUser() user: User,
    @Args('input') input: CreateReviewInput,
  ): Promise<Review> {
    if (user.role !== UserRole.CLIENT) {
      throw new ForbiddenException('Only clients can create reviews');
    }

    return this.reviewsService.createReview(user.id, input);
  }

  @Query(() => [Review])
  async getReviewsByBusiness(
    @Args('businessId') businessId: string
  ): Promise<Review[]> {
    return this.reviewsService.getReviewsByBusiness(businessId);
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
      throw new ForbiddenException('Only clients can update reviews');
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
      throw new ForbiddenException('Only clients can delete reviews');
    }

    return this.reviewsService.deleteReview(reviewId, user.id);
  }

  /** Flag a review for moderation. Any authenticated user can flag; admins can unflag. */
  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async flagReview(
    @Args('reviewId') reviewId: string,
    @Args('reason') reason: string,
  ): Promise<Review> {
    return this.reviewsService.flagReview(reviewId, reason);
  }

  @Mutation(() => Review)
  @UseGuards(JwtAuthGuard)
  async unflagReview(
    @CurrentUser() user: User,
    @Args('reviewId') reviewId: string,
  ): Promise<Review> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can unflag reviews');
    }

    return this.reviewsService.unflagReview(reviewId);
  }
}
