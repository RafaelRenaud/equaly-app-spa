import { Injectable } from "@angular/core";
import { CanActivateChild, Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivateChild {
  constructor(private router: Router) {}

  canActivateChild(): boolean {
    const token = sessionStorage.getItem("token");
    if (token) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
