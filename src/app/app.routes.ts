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
import { CredentialCreateComponent } from "./component/credential/create/credential-create.component";
import { DepartmentHubComponent } from "./component/department/hub/department-hub.component";
import { OccurTypeHubComponent } from "./component/occur-type/hub/occur-type-hub.component";
import { MyCompanyComponent } from "./component/my-company/my-company.component";

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
      { path: "my-company", component: MyCompanyComponent, pathMatch: "full" },
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
        canActivateChild: [AuthGuard],
        data: { roles: ["EQUALY_MASTER_ADMIN"] },
        children: [
          {
            path: "",
            component: CredentialHubComponent,
          },
          {
            path: "create",
            component: CredentialCreateComponent,
          },
        ],
      },
      {
        path: "departments",
        canActivateChild: [AuthGuard],
        children: [
          {
            path: "",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN", "COMMON_ADMIN"],
            },
            component: DepartmentHubComponent,
          },
          // {
          //   path: "create",
          //   data: {
          //     roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
          //   },
          //   component: DepartmentCreateComponent,
          // },
          // {
          //   path: "edit/:id",
          //   data: {
          //     roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
          //   },
          //   component: DepartmentEditComponent,
          // },
        ],
      },
      {
        path: "occur-types",
        canActivateChild: [AuthGuard],
        children: [
          {
            path: "",
            data: {
              roles: [
                "EQUALY_MASTER_ADMIN",
                "MASTER_ADMIN",
                "COMMON_ADMIN",
                "MASTER_QUALITY_INSPECTOR",
                "COMMON_QUALITY_INSPECTOR",
              ],
            },
            component: OccurTypeHubComponent,
          },
          // {
          //   path: "create",
          //   data: {
          //     roles: [
          //       "EQUALY_MASTER_ADMIN",
          //       "MASTER_ADMIN",
          //       "MASTER_QUALITY_INSPECTOR",
          //     ],
          //   },
          //   component: OccurTypeCreateComponent,
          // },
          // {
          //   path: "edit/:id",
          //   data: {
          //     roles: [
          //       "EQUALY_MASTER_ADMIN",
          //       "MASTER_ADMIN",
          //       "MASTER_QUALITY_INSPECTOR",
          //     ],
          //   },
          //   component: OccurTypeEditComponent,
          // },
        ],
      },
    ],
  },

  // Rota coringa
  // { path: "**", redirectTo: "" },
];
