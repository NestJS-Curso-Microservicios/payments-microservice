import Stripe from 'stripe';
import { Request, Response } from 'express';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SessionPaymentDto } from './dto/session-payment.dto';
import { envs } from '../config';

@Injectable()
export class PaymentsService {
	private readonly logger = new Logger(PaymentsService.name);
	private readonly stripe = new Stripe(envs.stripeSecretKey);

	constructor(
		@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy
	) {}

	async createPaymentSession(sessionPaymentDto: SessionPaymentDto) {
		const { currency, items, orderId } = sessionPaymentDto;

		const lineItems = items.map((item) => {
			return {
				price_data: {
					currency,
					product_data: {
						name: item.name,
					},
					unit_amount: Math.round(item.price * 100),
				},
				quantity: item.quantity,
			};
		});

		const session = await this.stripe.checkout.sessions.create({
			// Add your payment session configuration here
			payment_intent_data: {
				metadata: {
					orderId,
				},
			},
			line_items: lineItems,
			mode: 'payment',
			success_url: envs.stripeSuccessUrl,
			cancel_url: envs.stripeCancelUrl,
		});

		return {
			cancelUrl: session.cancel_url,
			successUrl: session.success_url,
			url: session.url,
		};
	}

	async success() {
		return 'This action returns a successful payment';
	}

	async cancel() {
		return 'This action cancels a payment';
	}

	async webhook(req: Request, res: Response) {
		const sig = req.headers['stripe-signature'];

		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				req['rawBody'],
				sig,
				envs.stripeEndpointSecret
			);
		} catch (err) {
			res.status(400).send(`Webhook Error: ${err.message}`);
			return;
		}

		switch (event.type) {
			case 'charge.succeeded':
				const chargeSucceeded = event.data.object;
				const payload = {
					stripePaymentId: chargeSucceeded.id,
					orderId: chargeSucceeded.metadata.orderId,
					receiptUrl: chargeSucceeded.receipt_url,
				};

				this.natsClient.emit('payment.succeeded', payload);

				break;
			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		return res.status(200).json({ sig });
	}
}
