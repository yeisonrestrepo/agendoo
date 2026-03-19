import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType } from './entities/media.entity';
import { Business } from '../businesses/entities/business.entity';
import { Employee } from '../employees/entities/employee.entity';
import { AddMediaInput, UpdateMediaInput } from './dto/media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async addMedia(ownerId: string, input: AddMediaInput): Promise<Media> {
    if (input.businessId) {
      const business = await this.businessRepository.findOne({
        where: { id: input.businessId },
      });
      if (!business) throw new NotFoundException('Business not found');
      if (business.ownerId !== ownerId) {
        throw new ForbiddenException('You do not own this business');
      }
    }

    if (input.employeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: input.employeeId },
        relations: ['business'],
      });
      if (!employee) throw new NotFoundException('Employee not found');
      if (employee.business.ownerId !== ownerId && employee.userId !== ownerId) {
        throw new ForbiddenException('You do not have access to this employee');
      }
    }

    const media = this.mediaRepository.create({
      ownerId,
      ...input,
      sortOrder: input.sortOrder ?? 0,
    });

    return this.mediaRepository.save(media);
  }

  async updateMedia(id: string, ownerId: string, input: UpdateMediaInput): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.ownerId !== ownerId) throw new ForbiddenException('Not your media');

    Object.assign(media, input);
    return this.mediaRepository.save(media);
  }

  async deleteMedia(id: string, ownerId: string): Promise<boolean> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    if (media.ownerId !== ownerId) throw new ForbiddenException('Not your media');

    await this.mediaRepository.remove(media);
    return true;
  }

  async getBusinessGallery(businessId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: [
        { businessId, type: MediaType.BUSINESS_PHOTO },
        { businessId, type: MediaType.BUSINESS_COVER },
      ],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getEmployeePortfolio(employeeId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { employeeId, type: MediaType.WORK_SAMPLE },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getMyMedia(ownerId: string): Promise<Media[]> {
    return this.mediaRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
