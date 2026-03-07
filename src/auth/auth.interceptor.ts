import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SetAccessTokenHeaderInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap((data) => {
        // data là body mà controller return
        if (data?.value?.accessToken) {
          res.setHeader('Authorization', `Bearer ${data.value.accessToken}`);
          delete data.value.accessToken;
        }
      }),
    );
  }
}
