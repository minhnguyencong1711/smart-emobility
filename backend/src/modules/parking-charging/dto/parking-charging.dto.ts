import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReserveParkingDto {
  @ApiProperty({ example: 'hub-suoi-tien' })
  @IsString()
  hubId!: string;

  @ApiProperty({ example: 'A10' })
  @IsString()
  bayCode!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(5)
  floor!: number;

  @ApiProperty({ example: 'VinFast Feliz' })
  @IsString()
  vehicleModel!: string;

  @ApiProperty({ example: '51H-228.08' })
  @IsString()
  plateNumber!: string;

  @ApiProperty({ example: 'Wed. Oct 08, 2026' })
  @IsString()
  arrivalDate!: string;

  @ApiProperty({ example: '16:30' })
  @IsString()
  arrivalTime!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(12)
  durationHours!: number;
}

export class StartChargingDto {
  @ApiProperty({ example: 'cp-a01' })
  @IsString()
  portId!: string;

  @ApiProperty({ example: 'CP-A01' })
  @IsString()
  portCode!: string;

  @ApiProperty({ enum: ['TYPE_2', 'DC_FAST', 'E_BIKE_AC'] })
  @IsIn(['TYPE_2', 'DC_FAST', 'E_BIKE_AC'])
  connectorType!: 'TYPE_2' | 'DC_FAST' | 'E_BIKE_AC';

  @ApiProperty({ example: 90 })
  @IsInt()
  @Min(60)
  @Max(100)
  targetSocPercent!: number;
}

export class RecoverChargingDto {
  @ApiProperty({ enum: ['RESUME', 'REASSIGN'] })
  @IsIn(['RESUME', 'REASSIGN'])
  mode!: 'RESUME' | 'REASSIGN';

  @ApiPropertyOptional({ example: 'CP-A02' })
  @IsOptional()
  @IsString()
  newPortCode?: string;
}
