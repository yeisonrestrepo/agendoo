import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DevicePlatform } from './entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  async registerDevice(
    userId: string,
    pushToken: string,
    platform: DevicePlatform,
    deviceName?: string,
  ): Promise<Device> {
    const existing = await this.devicesRepository.findOne({ where: { pushToken } });

    if (existing) {
      // Reassign the token to the current user (e.g. after logout/login on same device)
      existing.userId = userId;
      existing.platform = platform;
      existing.deviceName = deviceName;
      existing.active = true;
      return this.devicesRepository.save(existing);
    }

    const device = this.devicesRepository.create({ userId, pushToken, platform, deviceName });
    return this.devicesRepository.save(device);
  }

  async deregisterDevice(userId: string, pushToken: string): Promise<boolean> {
    const device = await this.devicesRepository.findOne({ where: { pushToken, userId } });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    device.active = false;
    await this.devicesRepository.save(device);
    return true;
  }

  async getActiveDevicesForUser(userId: string): Promise<Device[]> {
    return this.devicesRepository.find({ where: { userId, active: true } });
  }

  /** Returns all active push tokens for a list of user IDs (for bulk notification sending). */
  async getTokensForUsers(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];

    const devices = await this.devicesRepository
      .createQueryBuilder('device')
      .where('device.userId IN (:...userIds)', { userIds })
      .andWhere('device.active = true')
      .getMany();

    return devices.map(d => d.pushToken);
  }
}
