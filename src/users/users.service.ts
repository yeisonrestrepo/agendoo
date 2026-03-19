import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Favorite } from './entities/favorite.entity';
import { SavedSearch } from './entities/saved-search.entity';
import { ClientPreference } from './entities/client-preference.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(SavedSearch)
    private savedSearchesRepository: Repository<SavedSearch>,
    @InjectRepository(ClientPreference)
    private preferencesRepository: Repository<ClientPreference>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  /** Activate or suspend a user account. Admin-only operation. */
  async setUserActive(userId: string, active: boolean): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.active = active;
    return this.usersRepository.save(user);
  }

  async updateProfile(userId: string, updateData: Partial<Profile>): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    Object.assign(profile, updateData);
    return this.profilesRepository.save(profile);
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return this.favoritesRepository.find({ where: { userId } });
  }

  async addFavorite(userId: string, businessId?: string, employeeId?: string): Promise<Favorite> {
    if (!businessId && !employeeId) {
      throw new BadRequestException('Either businessId or employeeId must be provided');
    }
    const favorite = this.favoritesRepository.create({ userId, businessId, employeeId });
    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { id: favoriteId, userId },
    });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }
    await this.favoritesRepository.remove(favorite);
    return true;
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchesRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async saveSearch(userId: string, name: string, filters: string): Promise<SavedSearch> {
    const search = this.savedSearchesRepository.create({ userId, name, filters });
    return this.savedSearchesRepository.save(search);
  }

  async deleteSavedSearch(userId: string, searchId: string): Promise<boolean> {
    const search = await this.savedSearchesRepository.findOne({
      where: { id: searchId, userId },
    });
    if (!search) {
      throw new NotFoundException('Saved search not found');
    }
    await this.savedSearchesRepository.remove(search);
    return true;
  }

  async getPreferences(userId: string): Promise<ClientPreference> {
    let prefs = await this.preferencesRepository.findOne({ where: { userId } });
    if (!prefs) {
      prefs = this.preferencesRepository.create({ userId });
      prefs = await this.preferencesRepository.save(prefs);
    }
    return prefs;
  }

  async updatePreferences(userId: string, updateData: Partial<ClientPreference>): Promise<ClientPreference> {
    const prefs = await this.getPreferences(userId);
    Object.assign(prefs, updateData);
    return this.preferencesRepository.save(prefs);
  }
}
