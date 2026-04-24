import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const modifiedReq = req.clone({
    withCredentials: true   // 🔥 THIS IS THE MAGIC
  });

  return next(modifiedReq);
};