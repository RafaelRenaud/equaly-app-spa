import { Injectable } from "@angular/core";
import { CanActivateChild, Router } from "@angular/router";
import { SessionService } from "../service/session/session.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateChild {
  constructor(private session: SessionService, private router: Router) {}

  canActivateChild(): boolean {
    const token = this.session.getItem("Authorization");
    if (!token) {
      this.router.navigate(["/login"]);
      return false;
    } else {
      return true;
    }
  }
}