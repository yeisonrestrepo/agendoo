import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { ProfessionalsService } from '../professionals/professionals.service';
import { CreateReviewInput } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private professionalsService: ProfessionalsService,
  ) {}

  async createReview(
    clientId: string,
    input: CreateReviewInput,
  ): Promise<Review> {
    const booking = await this.bookingsRepository.findOne({
      where: { 
        id: input.bookingId,
        clientId,
        status: BookingStatus.COMPLETED 
      },
    });

    if (!booking) {
      throw new BadRequestException(
        'Solo puedes calificar reservas completadas'
      );
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: { bookingId: input.bookingId },
    });

    if (existingReview) {
      throw new BadRequestException(
        'Ya has calificado esta reserva'
      );
    }

    const review = this.reviewsRepository.create({
      clientId,
      professionalId: booking.professionalId,
      bookingId: input.bookingId,
      rating: input.rating,
      comment: input.comment,
    });

    const saved = await this.reviewsRepository.save(review);

    await this.professionalsService.updateAverageRating(booking.professionalId);

    return saved;
  }

  async getReviewsByProfessional(professionalId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { professionalId },
      relations: ['client', 'client.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async canReview(clientId: string, bookingId: string): Promise<boolean> {
    const booking = await this.bookingsRepository.findOne({
      where: { 
        id: bookingId,
        clientId,
        status: BookingStatus.COMPLETED 
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
      relations: ['client', 'client.profile', 'professional', 'professional.user', 'professional.user.profile'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async getReviewsByClient(clientId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { clientId },
      relations: ['professional', 'professional.user', 'professional.user.profile'],
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

    await this.professionalsService.updateAverageRating(review.professionalId);

    return updated;
  }

  async deleteReview(reviewId: string, clientId: string): Promise<boolean> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, clientId },
    });

    if (!review) {
      throw new NotFoundException('Review not found or you do not have permission to delete it');
    }

    await this.reviewsRepository.remove(review);

    await this.professionalsService.updateAverageRating(review.professionalId);

    return true;
  }

  async getAverageRating(professionalId: string): Promise<{ average: number; total: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'total')
      .where('review.professionalId = :professionalId', { professionalId })
      .getRawOne();

    return {
      average: parseFloat(result.average) || 0,
      total: parseInt(result.total) || 0,
    };
  }
}