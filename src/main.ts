import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// auto-validation
	app.useGlobalPipes(
		new ValidationPipe({
			// автоматически преобразовывает данные в нужный тип (например, string -> number, если так задано в dto)
			transform: true
		})
	)

	// CORS
	app.enableCors({
		origin: true,
		credentials: true
	})

	// Swagger
	const configSwagger = new DocumentBuilder()
		.setTitle('Documentation')
		.setDescription('List of endpoints')
		.addBearerAuth()
		.setVersion('1.0')
		.build()
	const documentFactory = () =>
		SwaggerModule.createDocument(app, configSwagger)
	SwaggerModule.setup('docs', app, documentFactory)

	console.log(`Start backend on port: ${process.env.PORT}...`)

	await app.listen(process.env.PORT)
}
bootstrap()
