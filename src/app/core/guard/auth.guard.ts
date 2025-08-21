import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
} from "@angular/router";
import { SessionService } from "../service/session/session.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private session: SessionService, private router: Router) {}

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    const token = this.session.getItem("Authorization");
    const requiredRole = route.data["roles"] as string[] | undefined;

    if (!token) {
      this.router.navigate(["/login"]);
      return false;
    }

    if (
      requiredRole &&
      !requiredRole.some((role) => this.session.hasRole(role))
    ) {
      this.router.navigate(["/"]);
      return false;
    }

    return true;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }
}
