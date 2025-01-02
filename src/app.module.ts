import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenMiddleware } from './untils/middleware/jwt-token.middleware';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { SuppilerModule } from './suppiler/suppiler.module';
import { TypeProductModule } from './type-product/type-product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PdfModule } from './pdf/pdf.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    JwtModule.register({
      secret: 'IIDqOqiTcRtZlosh5PIthimWGzAAGJirigqSuNaQpec',
      signOptions: { expiresIn: ' 1h' },
    }),
    ProductModule,
    CartModule,
    SuppilerModule,
    TypeProductModule,
    OrderModule,
    PaymentModule,
    CloudinaryModule,
    PdfModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
