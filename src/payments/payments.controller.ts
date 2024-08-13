import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { SessionPaymentDto } from './dto/session-payment.dto';

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post('create-payment-session')
	async createPaymentSession(@Body() sessionPaymentDto: SessionPaymentDto) {
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
