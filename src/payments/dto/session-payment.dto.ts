import {
	ArrayMinSize,
	IsArray,
	IsNumber,
	IsPositive,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SessionPaymentDto {
	@IsString()
	orderId: string;

	@IsString()
	currency: string;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => SessionPaymentItemDto)
	items: SessionPaymentItemDto[];
}

export class SessionPaymentItemDto {
	@IsString()
	name: string;

	@IsNumber()
	@IsPositive()
	price: number;

	@IsNumber()
	@IsPositive()
	quantity: number;
}
