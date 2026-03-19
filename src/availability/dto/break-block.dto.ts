import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { IsString, Matches } from 'class-validator';

/** A break period within a working day (e.g., lunch break). */
@ObjectType()
export class BreakBlock {
  /** Break start time in `HH:mm` format. */
  @Field()
  start: string;

  /** Break end time in `HH:mm` format. */
  @Field()
  end: string;
}

@InputType()
export class BreakBlockInput {
  /** Break start time in `HH:mm` format. */
  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'start must be in HH:mm format' })
  start: string;

  /** Break end time in `HH:mm` format. */
  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'end must be in HH:mm format' })
  end: string;
}
