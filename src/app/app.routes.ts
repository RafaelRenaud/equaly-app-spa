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
import { DepartmentCreateComponent } from "./component/department/create/department-create.component";
import { OccurTypeCreateComponent } from "./component/occur-type/create/occur-type-create.component";
import { OccurTypeEditComponent } from "./component/occur-type/edit/occur-type-edit.component";
import { DepartmentEditComponent } from "./component/department/edit/department-edit.component";
import { UserHubComponent } from "./component/user/hub/user-hub.component";
import { UserCreateComponent } from "./component/user/create/user-create.component";
import { UserEditComponent } from "./component/user/edit/user-edit.component";
import { OccurCreateComponent } from "./component/occur/create/occur-create.component";
import { OccurDraftComponent } from "./component/occur/draft/draft.component";
import { OccurPendingComponent } from "./component/occur/pending/pending.component";
import { OccurFeedbackComponent } from "./component/occur/feedback/occur-feedback/occur-feedback.component";
import { OccurEditComponent } from "./component/occur/edit/occur-edit/occur-edit.component";
import { NotFoundComponent } from "./component/error/not-found/not-found.component";
import { OccurHubComponent } from "./component/occur/hub/occur-hub/occur-hub.component";

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
    path: "occur-feedback",
    component: AuthLayoutComponent,
    children: [{ path: "", component: OccurFeedbackComponent }],
  },
  {
    path: "",
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: "", component: HomeComponent, pathMatch: "full" },
      { path: "my-account", component: MyAccountComponent },
      { path: "my-company", component: MyCompanyComponent },
      {
        path: "companies",
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
        children: [
          {
            path: "",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN", "COMMON_ADMIN"],
            },
            component: DepartmentHubComponent,
          },
          {
            path: "create",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
            },
            component: DepartmentCreateComponent,
          },
          {
            path: "edit/:id",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
            },
            component: DepartmentEditComponent,
          },
        ],
      },
      {
        path: "occur-types",
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
          {
            path: "create",
            data: {
              roles: [
                "EQUALY_MASTER_ADMIN",
                "MASTER_ADMIN",
                "MASTER_QUALITY_INSPECTOR",
              ],
            },
            component: OccurTypeCreateComponent,
          },
          {
            path: "edit/:id",
            data: {
              roles: [
                "EQUALY_MASTER_ADMIN",
                "MASTER_ADMIN",
                "MASTER_QUALITY_INSPECTOR",
              ],
            },
            component: OccurTypeEditComponent,
          },
        ],
      },
      {
        path: "users",
        children: [
          {
            path: "",
            /* data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN", "COMMON_ADMIN"],
            }, */
            component: UserHubComponent,
          },
          {
            path: "create",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
            },
            component: UserCreateComponent,
          },
          {
            path: "edit/:id",
            data: {
              roles: ["EQUALY_MASTER_ADMIN", "MASTER_ADMIN"],
            },
            component: UserEditComponent,
          },
        ],
      },
      {
        path: "occurs",
        children: [
          {
            path: "",
            data: {
              roles: ["MASTER_EVENT_OPENER",
                "COMMON_EVENT_OPENER",
                "MASTER_QUALITY_INSPECTOR",
                "COMMON_QUALITY_INSPECTOR"]
            },
            component: OccurHubComponent,
          },
          {
            path: "create",
            data: {
              roles: [
                "COMMON_EVENT_OPENER"
              ],
            },
            component: OccurCreateComponent,
          },
          {
            path: "drafts",
            data: {
              roles: [
                "COMMON_EVENT_OPENER"
              ],
            },
            component: OccurDraftComponent,
          },
          {
            path: "pendings",
            data: {
              roles: [
                "COMMON_EVENT_OPENER",
                "COMMON_QUALITY_INSPECTOR"
              ],
            },
            component: OccurPendingComponent
          },
          {
            path: "edit/:id",
            data: {
              roles: [
                "COMMON_EVENT_OPENER"
              ],
            },
            component: OccurEditComponent
          }
        ],
      }
    ],
  },
  {
    path: "not-found",
    children: [{ path: "", component: NotFoundComponent }],
  },

  // Rota coringa
  { path: "**", redirectTo: "not-found" },
];
