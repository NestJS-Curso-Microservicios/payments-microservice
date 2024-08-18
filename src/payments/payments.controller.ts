import { Request, Response } from 'express';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';
import { SessionPaymentDto } from './dto/session-payment.dto';

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	// @Post('create-payment-session')
	// async createPaymentSession(@Body() sessionPaymentDto: SessionPaymentDto) {
	// 	return await this.paymentsService.createPaymentSession(
	// 		sessionPaymentDto
	// 	);
	// }

	@MessagePattern('create.payment.session')
	async createPaymentSession(
		@Payload() sessionPaymentDto: SessionPaymentDto
	) {
		return await this.paymentsService.createPaymentSession(
			sessionPaymentDto
		);
	}

	@Get('success')
	async success() {
		return await this.paymentsService.success();
	}

	@Get('cancel')
	async cancel() {
		return await this.paymentsService.cancel();
	}

	@Post('webhook')
	async stripeWebhook(@Req() req: Request, @Res() res: Response) {
		return await this.paymentsService.webhook(req, res);
	}
}
