import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class HoldVehicleDto {
  @ApiProperty({ example: 'veh-102' })
  @IsString()
  vehicleId!: string;

  @ApiProperty({ example: '24 Oct 2026' })
  @IsString()
  pickupDate!: string;

  @ApiProperty({ example: '10:30 AM' })
  @IsString()
  pickupTime!: string;
}

export class ReturnVehicleDto {
  @ApiProperty({ example: 'hub-dorm-a' })
  @IsString()
  destinationHubId!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasFault!: boolean;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
