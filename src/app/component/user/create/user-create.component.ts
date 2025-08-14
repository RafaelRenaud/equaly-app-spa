import { Component } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import { DepartmentSearchComponent } from "../../department/search/department-search.component";
import { SessionService } from "../../../core/service/session/session.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { UniversalUserService } from "../../../core/service/user/universal-user.service";
import { UserService } from "../../../core/service/user/user.service";
import { Router } from "@angular/router";
import { UniversalUserResponse } from "../../../core/model/user/universal-user.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";

@Component({
  selector: "app-user-create",
  imports: [
    CompanySearchComponent,
    DepartmentSearchComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./user-create.component.html",
  styleUrl: "./user-create.component.scss",
  standalone: true,
})
export class UserCreateComponent {
  isEqualyMasterAdmin: boolean;
  universalUserExists: boolean;
  universalUser: UniversalUserResponse | null = null;
  selectedCompany: CompanyResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;

  createUserForm!: FormGroup;

  constructor(
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private universalUserService: UniversalUserService,
    private userService: UserService,
    private router: Router
  ) {
    this.isEqualyMasterAdmin = false;
    this.universalUserExists = false;
    this.createUserForm = this.formBuilder.group({
      documentType: ["", [Validators.required]],
      document: ["", [Validators.required, Validators.pattern(/^\d{1,11}$/)]],
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      ],
      username: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128),
        ],
      ],
      login: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(32),
        ],
      ],
      nickname: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(32),
        ],
      ],
      email: ["", [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    if (this.sessionService.hasRole("EQUALY_MASTER_ADMIN")) {
      this.isEqualyMasterAdmin = true;
    }
  }

  checkUniversalUserExists() {
    this.loadingService.show();
    this.universalUserService
      .getUsers("document", this.createUserForm.get("document")?.value, 0, 1)
      .subscribe({
        next: (res) => {
          if (res.universalUsers.length === 0) {
            this.universalUserExists = false;
            this.createUserForm.get("name")?.enable();
            this.loadingService.hide();
          } else {
            this.universalUserExists = true;
            this.universalUser = res.universalUsers[0];
            this.createUserForm
              .get("document")
              ?.patchValue(this.universalUser.document);
            this.createUserForm
              .get("documentType")
              ?.patchValue(this.universalUser.documentType);
            this.createUserForm.get("name")?.disable();
            this.createUserForm.get("documentType")?.disable();
            this.loadingService.hide();
          }
        },
        error: (err) => {
          this.loadingService.hide();
          this.universalUserExists = false;
          this.router.navigate(["/users/create"], {
            queryParams: {
              action: "ERROR",
              message:
                "Erro ao consultar a base de usuário, por favor contate o administrador.",
            },
          });
        },
      });
  }

  setNickname() {
    const username: string = this.createUserForm.get("username")?.value || "";
    const firstWord = username.split(" ")[0];
    this.createUserForm.patchValue({ nickname: firstWord });
  }

  onSelectCompany(company: CompanyResponse | null): void {
    this.selectedCompany = company;
  }

  onSelectDepartment(department: DepartmentResponse | null): void {
    this.selectedDepartment = department;
  }
}
