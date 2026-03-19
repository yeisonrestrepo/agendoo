import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateReviewInput } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private businessesService: BusinessesService,
  ) {}

  async createReview(
    clientId: string,
    input: CreateReviewInput,
  ): Promise<Review> {
    const booking = await this.bookingsRepository.findOne({
      where: {
        id: input.bookingId,
        clientId,
        status: BookingStatus.FINALIZED
      },
    });

    if (!booking) {
      throw new BadRequestException('You can only review finalized bookings');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: { bookingId: input.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    const review = this.reviewsRepository.create({
      clientId,
      businessId: booking.businessId,
      bookingId: input.bookingId,
      rating: input.rating,
      comment: input.comment,
      verified: true,
    });

    const saved = await this.reviewsRepository.save(review);

    await this.businessesService.updateAverageRating(booking.businessId);

    return saved;
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async canReview(clientId: string, bookingId: string): Promise<boolean> {
    const booking = await this.bookingsRepository.findOne({
      where: {
        id: bookingId,
        clientId,
        status: BookingStatus.FINALIZED
      },
    });

    if (!booking) return false;

    const existingReview = await this.reviewsRepository.findOne({
      where: { bookingId },
    });

    return !existingReview;
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getReviewsByClient(clientId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateReview(
    reviewId: string,
    clientId: string,
    input: Partial<CreateReviewInput>
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, clientId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or you do not have permission to edit it');
    }

    if (input.rating !== undefined) {
      review.rating = input.rating;
    }

    if (input.comment !== undefined) {
      review.comment = input.comment;
    }

    const updated = await this.reviewsRepository.save(review);

    await this.businessesService.updateAverageRating(review.businessId);

    return updated;
  }

  async deleteReview(reviewId: string, clientId: string): Promise<boolean> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, clientId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or you do not have permission to delete it');
    }

    const businessId = review.businessId;
    await this.reviewsRepository.remove(review);

    await this.businessesService.updateAverageRating(businessId);

    return true;
  }

  async flagReview(reviewId: string, reason: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.flagged = true;
    review.flagReason = reason;

    return this.reviewsRepository.save(review);
  }

  async unflagReview(reviewId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.flagged = false;
    review.flagReason = undefined;

    return this.reviewsRepository.save(review);
  }

}
