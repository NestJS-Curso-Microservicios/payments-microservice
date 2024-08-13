import { PartialType } from '@nestjs/mapped-types';
import { SessionPaymentDto } from './session-payment.dto';

export class UpdatePaymentDto extends PartialType(SessionPaymentDto) {}
