import {
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest
} from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { LoginService } from "../service/login/login.service";
import { SessionService } from "../service/session/session.service";

const bypassSessionAuth = [
  /^\/authentication\/v2\/oauth\/token$/,
  /^\/authentication\/v2\/oauth\/token\/refresh$/,
  /^\/authentication\/v2\/recovery$/,
  /^\/quality\/v1\/occurs\/\d+\/rating$/,
];

function shouldUseSessionAuth(req: HttpRequest<unknown>): boolean {
  const pathname = new URL(req.url, "http://localhost").pathname;

  return !bypassSessionAuth.some(route => route.test(pathname));
}

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
): Observable<HttpEvent<unknown>> => {
  const loginService = inject(LoginService);
  const sessionService = inject(SessionService);

  if (!shouldUseSessionAuth(req)) {
    return next(req);
  }

  const sessionToken = sessionService.getItem("Authorization");

  const authReq = req.headers.has("Authorization") || !sessionToken
    ? req
    : req.clone({ setHeaders: { Authorization: sessionToken } });

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && sessionToken) {
        loginService.logout();
      }

      return throwError(() => error);
    })
  );
};
