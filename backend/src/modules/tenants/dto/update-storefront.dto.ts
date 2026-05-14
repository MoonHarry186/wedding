import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsObject,
  IsHexColor,
  MaxLength,
  IsFQDN,
} from 'class-validator';

export class UpdateStorefrontDto {
  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  welcomeText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;

  @IsOptional()
  @IsHexColor()
  themeColor?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetCustomDomainDto {
  @IsFQDN()
  customDomain: string;
}
