import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { LoginComponent } from "./component/login/login.component";
import { RecoveryComponent } from "./component/recovery/recovery.component";
import { AuthGuard } from "./core/guard/auth.guard";
import { HomeComponent } from "./component/home/home.component";
import { LoginGuard } from "./core/guard/login.guard";

export const routes: Routes = [
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      { path: "login", component: LoginComponent, canActivate: [LoginGuard] },
      { path: "recovery", component: RecoveryComponent },
    ],
  },
  {
    path: "",
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: "home", component: HomeComponent }, 
      // outras rotas protegidas aqui
    ],
  }
];
