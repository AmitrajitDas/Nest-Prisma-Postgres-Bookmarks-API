import { Controller, Module, Get } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

@Controller()
class AppController {
  @Get()
  getRootRoute() {
    return "Hello World";
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
};

bootstrap();
