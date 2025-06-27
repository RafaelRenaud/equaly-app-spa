import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { LoginComponent } from "./component/login/login.component";
import { RecoveryComponent } from "./component/recovery/recovery.component";
import { AuthGuard } from "./core/guard/auth.guard";

export const routes: Routes = [
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      { path: "login", component: LoginComponent },
      { path: "recovery", component: RecoveryComponent}
    ],
  }
];
