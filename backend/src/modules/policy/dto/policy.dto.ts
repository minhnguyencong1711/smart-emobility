import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePolicyDto {
  @ApiPropertyOptional({ minimum: 5, maximum: 60 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  gracePeriodMins?: number;

  @ApiPropertyOptional({ minimum: 50, maximum: 95 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(95)
  gridWarningThreshold?: number;

  @ApiPropertyOptional({ minimum: 75, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(75)
  @Max(99)
  gridCriticalThreshold?: number;

  @ApiPropertyOptional({ minimum: 50, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(99)
  baySaturationThreshold?: number;

  @ApiPropertyOptional({ minimum: 5, maximum: 50 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(50)
  minDispatchSoC?: number;
}
