import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { DevicesService } from './devices.service';
import { DevicesResolver } from './devices.resolver';
import { Device } from './entities/device.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  providers: [NotificationsService, DevicesService, DevicesResolver],
  exports: [NotificationsService, DevicesService],
})
export class NotificationsModule {}
