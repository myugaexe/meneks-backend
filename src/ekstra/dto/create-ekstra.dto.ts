// src/ekstra/dto/create-ekstra.dto.ts
import {
  IsString,
  IsDateString,
  IsInt,
  ValidateNested,
  IsArray,
} from 'class-validator'
import { Type } from 'class-transformer'

class ScheduleDto {
  @IsString()
  day: string

  @IsString()
  startTime: string

  @IsString()
  endTime: string
}

export class CreateEkstraDto {
  @IsString()
  name: string

  @IsString()
  description: string

  @IsInt()
  maxMembers: number

  @IsDateString()
  registrationStart: string

  @IsDateString()
  registrationEnd: string

  @IsInt()
  pembinaId: number // 👈 tambahkan ini

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules: ScheduleDto[]
}
