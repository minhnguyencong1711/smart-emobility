import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListIncidentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hubId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class IsolateIncidentDto {
  @ApiPropertyOptional({ example: 'Đinh Phạm Ngọc Phước' })
  @IsOptional()
  @IsString()
  assignedCrew?: string;
}
