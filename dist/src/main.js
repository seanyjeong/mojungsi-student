"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('정시 계산 엔진 API')
        .setDescription('대학 정시 환산점수 계산 API')
        .setVersion('1.0')
        .addTag('calculators', '환산점수 계산')
        .addTag('universities', '대학/학과 조회')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map