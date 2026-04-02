import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpEvent,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { LoginService } from "../service/login/login.service";
import { SessionService } from "../service/session/session.service";
import { Router } from "@angular/router";

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const loginService = inject(LoginService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const excludedUrls = [
    "/authentication/v2/oauth/token",
    "/authentication/v2/oauth/token/refresh",
    "/authentication/v2/recovery",
  ];

  const isPublic = excludedUrls.some((url) => req.url.includes(url));
  if (isPublic) return next(req);

  const token = sessionService.getItem("Authorization");
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: token } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && token) {
        return loginService.refresh().pipe(
          switchMap((response) => {
            sessionService.saveSessionData(
              response.token_type,
              response.access_token,
              response.refresh_token,
              response.expires_in
            );

            const retryReq = req.clone({
              setHeaders: {
                Authorization: sessionService.getItem("Authorization")!,
              },
            });

            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Lógica direta de limpeza e redirecionamento
            sessionStorage.clear();
            router.navigateByUrl("/login", { replaceUrl: true });
            return throwError(() => refreshError);
          })
        );
      }
      
      // Trata outros 401
      if (error.status === 401) {
        sessionStorage.clear();
        router.navigateByUrl("/login", { replaceUrl: true });
      }
      
      return throwError(() => error);
    })
  );
};