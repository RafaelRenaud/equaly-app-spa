import { HttpInterceptorFn } from '@angular/common/http';

export const channelInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone a requisição e adiciona o header
  const clonedReq = req.clone({
    setHeaders: {
      'x-equaly-channel': 'EQUALY'
    }
  });
  
  return next(clonedReq);
};