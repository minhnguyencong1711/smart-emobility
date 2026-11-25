import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@vnuhcm.edu.vn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'student123' })
  @IsString()
  @MinLength(1)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Công Minh' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'student.new@vnuhcm.edu.vn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Campus@2026' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'student@vnuhcm.edu.vn' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP code must be 6 digits' })
  otp!: string;

  @ApiProperty({ example: 'Campus@2026' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ResetLockoutDto {
  @ApiProperty({ example: 'student@vnuhcm.edu.vn' })
  @IsEmail()
  email!: string;
}
