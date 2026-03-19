import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { User, UserRole } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Favorite } from './entities/favorite.entity';
import { SavedSearch } from './entities/saved-search.entity';
import { ClientPreference } from './entities/client-preference.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileInput, AddFavoriteInput, SaveSearchInput, UpdatePreferencesInput } from './dto/user.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User | null> {
    return this.usersService.findById(user.id);
  }

  @Mutation(() => Profile)
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProfileInput,
  ): Promise<Profile> {
    return this.usersService.updateProfile(user.id, input);
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async setUserActive(
    @CurrentUser() user: User,
    @Args('userId', { type: () => ID }) userId: string,
    @Args('active') active: boolean,
  ): Promise<User> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user account status');
    }
    return this.usersService.setUserActive(userId, active);
  }

  // ─── Favorites ───────────────────────────────────────────────────────────────

  @Query(() => [Favorite])
  @UseGuards(JwtAuthGuard)
  async myFavorites(@CurrentUser() user: User): Promise<Favorite[]> {
    return this.usersService.getFavorites(user.id);
  }

  @Mutation(() => Favorite)
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @CurrentUser() user: User,
    @Args('input') input: AddFavoriteInput,
  ): Promise<Favorite> {
    return this.usersService.addFavorite(user.id, input.businessId, input.employeeId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeFavorite(
    @CurrentUser() user: User,
    @Args('favoriteId', { type: () => ID }) favoriteId: string,
  ): Promise<boolean> {
    return this.usersService.removeFavorite(user.id, favoriteId);
  }

  // ─── Saved Searches ──────────────────────────────────────────────────────────

  @Query(() => [SavedSearch])
  @UseGuards(JwtAuthGuard)
  async mySavedSearches(@CurrentUser() user: User): Promise<SavedSearch[]> {
    return this.usersService.getSavedSearches(user.id);
  }

  @Mutation(() => SavedSearch)
  @UseGuards(JwtAuthGuard)
  async saveSearch(
    @CurrentUser() user: User,
    @Args('input') input: SaveSearchInput,
  ): Promise<SavedSearch> {
    return this.usersService.saveSearch(user.id, input.name, input.filters);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteSavedSearch(
    @CurrentUser() user: User,
    @Args('searchId', { type: () => ID }) searchId: string,
  ): Promise<boolean> {
    return this.usersService.deleteSavedSearch(user.id, searchId);
  }

  // ─── Preferences ─────────────────────────────────────────────────────────────

  @Query(() => ClientPreference)
  @UseGuards(JwtAuthGuard)
  async myPreferences(@CurrentUser() user: User): Promise<ClientPreference> {
    return this.usersService.getPreferences(user.id);
  }

  @Mutation(() => ClientPreference)
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @CurrentUser() user: User,
    @Args('input') input: UpdatePreferencesInput,
  ): Promise<ClientPreference> {
    return this.usersService.updatePreferences(user.id, input);
  }
}
