import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionPaymentDto } from './dto/session-payment.dto';
import { envs } from '../config';

@Injectable()
export class PaymentsService {
	private readonly stripe = new Stripe(envs.stripeSecretKey);

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

		return await this.stripe.checkout.sessions.create({
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
				console.log({ chargeSucceeded });
				break;
			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		return res.status(200).json({ sig });
	}
}
