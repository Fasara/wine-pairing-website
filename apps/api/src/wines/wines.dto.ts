import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { WINE_TYPES, WineType } from '../database/schema';

/** Treat empty query values (`?type=`) as absent. */
const emptyToUndefined = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

/** Parses a numeric query value; absent or empty values fall back to the default. */
const intParam = (fallback: number) => ({ value }: { value: unknown }) =>
  value === undefined || value === '' ? fallback : Number(value);

export class ListWinesQuery {
  @ApiPropertyOptional({ enum: WINE_TYPES })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(WINE_TYPES)
  type?: WineType;

  @ApiPropertyOptional()
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive match on name, winery or grape' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Transform(intParam(1))
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @Transform(intParam(12))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 12;
}
