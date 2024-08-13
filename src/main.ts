import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
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
	await app.listen(envs.port);

	logger.log(
		`Payments Microservice is running on http://localhost:${envs.port}`
	);
}
bootstrap().then(() => console.log('Payments Microservice is running'));
