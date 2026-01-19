import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    forbidNonWhitelisted: false,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('정시 계산 엔진 API')
    .setDescription('대학 정시 환산점수 계산 API')
    .setVersion('1.0')
    .addTag('calculators', '환산점수 계산')
    .addTag('universities', '대학/학과 조회')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 8900;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api`);
}

bootstrap();
