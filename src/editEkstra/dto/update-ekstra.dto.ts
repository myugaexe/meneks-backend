import {
  IsString,
  IsDateString,
  IsInt,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleUpdateDto {
  @IsString()
  day: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class UpdateEkstraDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsInt()
  maxMembers: number;

  @IsDateString()
  registrationStart: string;

  @IsDateString()
  registrationEnd: string;

  @IsOptional()
  @IsInt()
  pembinaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleUpdateDto)
  schedules: ScheduleUpdateDto[];
}
