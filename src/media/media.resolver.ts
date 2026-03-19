import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { AddMediaInput, UpdateMediaInput } from './dto/media.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Media)
export class MediaResolver {
  constructor(private mediaService: MediaService) {}

  @Query(() => [Media])
  async getBusinessGallery(
    @Args('businessId') businessId: string,
  ): Promise<Media[]> {
    return this.mediaService.getBusinessGallery(businessId);
  }

  @Query(() => [Media])
  async getEmployeePortfolio(
    @Args('employeeId') employeeId: string,
  ): Promise<Media[]> {
    return this.mediaService.getEmployeePortfolio(employeeId);
  }

  @Query(() => [Media])
  @UseGuards(JwtAuthGuard)
  async getMyMedia(@CurrentUser() user: User): Promise<Media[]> {
    return this.mediaService.getMyMedia(user.id);
  }

  @Mutation(() => Media)
  @UseGuards(JwtAuthGuard)
  async addMedia(
    @CurrentUser() user: User,
    @Args('input') input: AddMediaInput,
  ): Promise<Media> {
    return this.mediaService.addMedia(user.id, input);
  }

  @Mutation(() => Media)
  @UseGuards(JwtAuthGuard)
  async updateMedia(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateMediaInput,
  ): Promise<Media> {
    return this.mediaService.updateMedia(id, user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMedia(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.mediaService.deleteMedia(id, user.id);
  }
}
