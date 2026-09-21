import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, switchMap, throwError } from "rxjs";
import { LoginService } from "../service/login/login.service";
import { SessionService } from "../service/session/session.service";

const bypassSessionAuth = [
  /^\/authentication\/v2\/oauth\/token$/,
  /^\/authentication\/v2\/oauth\/token\/refresh$/,
  /^\/authentication\/v2\/recovery$/,
  /^\/quality\/v1\/occurs\/\d+\/rating$/,
];

function shouldUseSessionAuth(req: HttpRequest<unknown>): boolean {
  // Funciona tanto para URL absoluta quanto relativa e ignora query params.
  const pathname = new URL(req.url, "http://localhost").pathname;

  return !bypassSessionAuth.some(route => route.test(pathname));
}

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
): Observable<HttpEvent<unknown>> => {
  const loginService = inject(LoginService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const useSessionAuth = shouldUseSessionAuth(req);
  const sessionToken = sessionService.getItem("Authorization");

  // Rotas públicas: segue direto, sem refresh/logout.
  if (!useSessionAuth) {
    return next(req);
  }

  // Só injeta o header se ele ainda não veio no request.
  const authReq = req.headers.has("Authorization")
    ? req
    : (sessionToken
        ? req.clone({ setHeaders: { Authorization: sessionToken } })
        : req);

  return next(authReq).pipe(
    catchError(error => {
      if (error.status !== 401 || !sessionToken) {
        return throwError(() => error);
      }

      return loginService.refresh().pipe(
        switchMap(response => {
          sessionService.saveSessionData(
            response.token_type,
            response.access_token,
            response.refresh_token,
            response.expires_in
          );

          return next(
            req.clone({
              setHeaders: {
                Authorization: sessionService.getItem("Authorization")!,
              },
            })
          );
        }),
        catchError(refreshError => {
          localStorage.clear();
          router.navigateByUrl("/login", { replaceUrl: true });
          return throwError(() => refreshError);
        })
      );
    })
  );
};