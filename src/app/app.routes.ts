import { Routes } from "@angular/router";
import { HomeComponent } from "./component/home/home.component";
import { LoginComponent } from "./component/login/login.component";
import { RecoveryComponent } from "./component/recovery/recovery.component";
import { AuthGuard } from "./core/guard/auth.guard";
import { LoginGuard } from "./core/guard/login.guard";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { MyAccountComponent } from "./component/my-account/my-account.component";
import { CompanyHubComponent } from "./component/company/hub/company-hub.component";
import { CredentialHubComponent } from "./component/credential/hub/credential-hub.component";
import { CompanyCreateComponent } from "./component/company/create/company-create.component";
import { CompanyEditComponent } from "./component/company/edit/company-edit.component";

export const routes: Routes = [
  {
    path: "login",
    component: AuthLayoutComponent,
    children: [
      { path: "", component: LoginComponent, canActivate: [LoginGuard] },
    ],
  },
  {
    path: "recovery",
    component: AuthLayoutComponent,
    children: [{ path: "", component: RecoveryComponent }],
  },
  {
    path: "",
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: "", component: HomeComponent, pathMatch: "full" },
      { path: "my-account", component: MyAccountComponent, pathMatch: "full" },
      {
        path: "companies",
        canActivateChild: [AuthGuard],
        data: { roles: ["EQUALY_MASTER_ADMIN"] },
        children: [
          {
            path: "",
            component: CompanyHubComponent,
          },
          {
            path: "create",
            component: CompanyCreateComponent,
          },
          {
            path: "edit/:id",
            component: CompanyEditComponent,
          },
        ],
      },
      {
        path: "credentials",
        component: CredentialHubComponent,
        pathMatch: "full",
        data: { roles: ["EQUALY_MASTER_ADMIN"] },
      },
    ],
  },

  // Rota coringa
  // { path: "**", redirectTo: "" },
];
