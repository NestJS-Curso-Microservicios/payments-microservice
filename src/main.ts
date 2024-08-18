import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
	const logger = new Logger('Bootstrap-Payments');
	const app = await NestFactory.create(AppModule, {
		rawBody: true,
	});
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);

	app.connectMicroservice<MicroserviceOptions>(
		{
			transport: Transport.NATS,
			options: {
				servers: envs.natsServers,
			},
		},
		{
			inheritAppConfig: true,
		}
	);

	await app.startAllMicroservices();
	await app.listen(envs.port);

	logger.log(
		`Payments Microservice is running on http://localhost:${envs.port}`
	);
}

bootstrap().then(() => console.log('Payments Microservice is running'));
