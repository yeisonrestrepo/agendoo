import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { OAuthConnection } from './entities/oauth-connection.entity';
import { Favorite } from './entities/favorite.entity';
import { SavedSearch } from './entities/saved-search.entity';
import { ClientPreference } from './entities/client-preference.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, OAuthConnection, Favorite, SavedSearch, ClientPreference]),
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
