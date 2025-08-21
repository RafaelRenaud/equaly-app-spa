import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session/session.service";

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(): boolean {
    const token = this.session.getItem("Authorization");

    if (token) {
      this.router.navigate(["/"]);
      return false;
    }

    return true;
  }
}
