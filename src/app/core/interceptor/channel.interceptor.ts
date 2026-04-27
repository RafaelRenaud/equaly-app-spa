import { HttpInterceptorFn } from '@angular/common/http';

export const channelInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/rating')) {
    return next(req);
  }
  
  const clonedReq = req.clone({
    setHeaders: {
      'x-equaly-channel': 'EQUALY'
    }
  });
  
  return next(clonedReq);
};