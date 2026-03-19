import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientNote } from './entities/client-note.entity';
import { CancellationPolicy } from './entities/cancellation-policy.entity';
import { BusinessClient } from './entities/business-client.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CrmService } from './crm.service';
import { BusinessesService } from '../businesses/businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { DataloaderService } from '../common/dataloaders/dataloader.service';
import {
  CreateClientNoteInput,
  UpdateClientNoteInput,
  CreateCancellationPolicyInput,
  UpdateCancellationPolicyInput,
  CreateManualBookingInput,
  ClientVisitSummary,
} from './dto/crm.dto';
import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
class CancellationPenaltyResult {
  @Field()
  canCancel: boolean;

  @Field(() => Float)
  penaltyPercentage: number;
}

@Resolver(() => ClientNote)
export class ClientNoteResolver {
  constructor(
    private crmService: CrmService,
    private loaders: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async client(@Parent() note: ClientNote): Promise<User> {
    if (note.client) return note.client;
    return this.loaders.usersById.load(note.clientId);
  }

  @ResolveField(() => User)
  async createdBy(@Parent() note: ClientNote): Promise<User> {
    if (note.createdBy) return note.createdBy;
    return this.loaders.usersById.load(note.createdById);
  }
}

@Resolver(() => ClientVisitSummary)
export class ClientVisitSummaryResolver {
  constructor(private loaders: DataloaderService) {}

  @ResolveField(() => User)
  async client(@Parent() summary: ClientVisitSummary): Promise<User> {
    if (summary.clientId) {
      return this.loaders.usersById.load(summary.clientId);
    }
    return summary.client;
  }
}

@Resolver()
export class CrmResolver {
  constructor(
    private crmService: CrmService,
    private businessesService: BusinessesService,
  ) {}

  private async getBusinessId(user: User): Promise<string> {
    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business.id;
  }

  @Mutation(() => ClientNote)
  @UseGuards(JwtAuthGuard)
  async createClientNote(
    @CurrentUser() user: User,
    @Args('input') input: CreateClientNoteInput,
  ): Promise<ClientNote> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can create client notes');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.createNote(businessId, user.id, input);
  }

  @Mutation(() => ClientNote)
  @UseGuards(JwtAuthGuard)
  async updateClientNote(
    @CurrentUser() user: User,
    @Args('noteId') noteId: string,
    @Args('input') input: UpdateClientNoteInput,
  ): Promise<ClientNote> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can update client notes');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.updateNote(noteId, businessId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteClientNote(
    @CurrentUser() user: User,
    @Args('noteId') noteId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can delete client notes');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.deleteNote(noteId, businessId);
  }

  @Query(() => [ClientNote])
  @UseGuards(JwtAuthGuard)
  async getClientNotes(
    @CurrentUser() user: User,
    @Args('clientId') clientId: string,
  ): Promise<ClientNote[]> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can view client notes');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.getNotesByClient(businessId, clientId);
  }

  @Query(() => [Booking])
  @UseGuards(JwtAuthGuard)
  async getClientVisitHistory(
    @CurrentUser() user: User,
    @Args('clientId') clientId: string,
  ): Promise<Booking[]> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can view client history');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.getClientVisitHistory(businessId, clientId);
  }

  @Query(() => ClientVisitSummary)
  @UseGuards(JwtAuthGuard)
  async getClientVisitSummary(
    @CurrentUser() user: User,
    @Args('clientId') clientId: string,
  ): Promise<ClientVisitSummary> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can view client summary');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.getClientVisitSummary(businessId, clientId);
  }

  @Query(() => [ClientVisitSummary])
  @UseGuards(JwtAuthGuard)
  async getBusinessClients(
    @CurrentUser() user: User,
  ): Promise<ClientVisitSummary[]> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can view clients');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.getBusinessClients(businessId);
  }

  @Mutation(() => Booking)
  @UseGuards(JwtAuthGuard)
  async createManualBooking(
    @CurrentUser() user: User,
    @Args('input') input: CreateManualBookingInput,
  ): Promise<Booking> {
    if (user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.EMPLOYEE) {
      throw new ForbiddenException('Only business staff can create manual bookings');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.createManualBooking(businessId, user.id, input);
  }

  @Mutation(() => CancellationPolicy)
  @UseGuards(JwtAuthGuard)
  async createCancellationPolicy(
    @CurrentUser() user: User,
    @Args('input') input: CreateCancellationPolicyInput,
  ): Promise<CancellationPolicy> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can create cancellation policies');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.createPolicy(businessId, input);
  }

  @Mutation(() => CancellationPolicy)
  @UseGuards(JwtAuthGuard)
  async updateCancellationPolicy(
    @CurrentUser() user: User,
    @Args('policyId') policyId: string,
    @Args('input') input: UpdateCancellationPolicyInput,
  ): Promise<CancellationPolicy> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can update cancellation policies');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.updatePolicy(policyId, businessId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteCancellationPolicy(
    @CurrentUser() user: User,
    @Args('policyId') policyId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can delete cancellation policies');
    }

    const businessId = await this.getBusinessId(user);
    return this.crmService.deletePolicy(policyId, businessId);
  }

  @Query(() => [CancellationPolicy])
  async getCancellationPolicies(
    @Args('businessId') businessId: string,
  ): Promise<CancellationPolicy[]> {
    return this.crmService.getPolicies(businessId);
  }

  @Query(() => CancellationPenaltyResult)
  @UseGuards(JwtAuthGuard)
  async checkCancellationPenalty(
    @Args('bookingId') bookingId: string,
  ): Promise<{ canCancel: boolean; penaltyPercentage: number }> {
    return this.crmService.checkCancellationPenalty(bookingId);
  }

  // ── BusinessClient ────────────────────────────────────────────────────────────

  @Mutation(() => BusinessClient)
  @UseGuards(JwtAuthGuard)
  async upsertBusinessClient(
    @CurrentUser() user: User,
    @Args('clientId', { type: () => ID }) clientId: string,
    @Args('alias', { nullable: true }) alias?: string,
  ): Promise<BusinessClient> {
    const business = await this.businessesService.findByOwnerId(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.crmService.upsertBusinessClient(business.id, clientId, alias);
  }

  @Query(() => [BusinessClient])
  @UseGuards(JwtAuthGuard)
  async getBusinessClientRecords(@CurrentUser() user: User): Promise<BusinessClient[]> {
    const business = await this.businessesService.findByOwnerId(user.id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return this.crmService.getAllBusinessClients(business.id);
  }
}
