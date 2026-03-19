import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Device, DevicePlatform } from './entities/device.entity';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Device)
export class DevicesResolver {
  constructor(private devicesService: DevicesService) {}

  @Mutation(() => Device)
  @UseGuards(JwtAuthGuard)
  async registerDevice(
    @CurrentUser() user: User,
    @Args('pushToken') pushToken: string,
    @Args('platform', { type: () => DevicePlatform }) platform: DevicePlatform,
    @Args('deviceName', { nullable: true }) deviceName?: string,
  ): Promise<Device> {
    return this.devicesService.registerDevice(user.id, pushToken, platform, deviceName);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deregisterDevice(
    @CurrentUser() user: User,
    @Args('pushToken') pushToken: string,
  ): Promise<boolean> {
    return this.devicesService.deregisterDevice(user.id, pushToken);
  }

  @Query(() => [Device])
  @UseGuards(JwtAuthGuard)
  async myDevices(@CurrentUser() user: User): Promise<Device[]> {
    return this.devicesService.getActiveDevicesForUser(user.id);
  }
}
