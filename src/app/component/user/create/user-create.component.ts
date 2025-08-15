import { Component, OnInit } from "@angular/core";
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
import { Router, RouterModule } from "@angular/router";
import { UniversalUserResponse } from "../../../core/model/user/universal-user.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { UserCreateRequest } from "../../../core/model/user/user-create-request.model";
import { UniversalUserCreateRequest } from "../../../core/model/user/universal-user-create-request.model";

@Component({
  selector: "app-user-create",
  imports: [
    CompanySearchComponent,
    DepartmentSearchComponent,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: "./user-create.component.html",
  styleUrl: "./user-create.component.scss",
  standalone: true,
})
export class UserCreateComponent implements OnInit {
  isEqualyMasterAdmin = false;
  universalUserExists = false;
  universalUser: UniversalUserResponse | null = null;
  selectedCompany: CompanyResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;
  createUserForm!: FormGroup;

  // Flags para feedback visual
  invalidDocument = false;
  invalidName = false;
  invalidUsername = false;
  invalidLogin = false;
  invalidNickname = false;
  invalidEmail = false;

  constructor(
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private universalUserService: UniversalUserService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.createUserForm = this.formBuilder.group({
      documentType: ["", Validators.required],
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

    if (this.sessionService.hasRole("EQUALY_MASTER_ADMIN")) {
      this.isEqualyMasterAdmin = true;
    }

    // Atualiza flags sempre que form mudar
    this.createUserForm.statusChanges.subscribe(() => {
      this.invalidDocument = this.isFieldInvalid("document");
      this.invalidName = this.isFieldInvalid("name");
      this.invalidUsername = this.isFieldInvalid("username");
      this.invalidLogin = this.isFieldInvalid("login");
      this.invalidNickname = this.isFieldInvalid("nickname");
      this.invalidEmail = this.isFieldInvalid("email");
    });
  }

  private isFieldInvalid(controlName: string): boolean {
    const control = this.createUserForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  // Verifica universalUser pelo documento
  checkUniversalUserExists() {
    const docCtrl = this.createUserForm.get("document");
    if (!docCtrl || docCtrl.invalid) return;

    this.loadingService.show();
    this.universalUserService
      .getUsers("document", docCtrl.value, 0, 1)
      .subscribe({
        next: (res) => {
          if (res.universalUsers.length === 0) {
            this.universalUserExists = false;
            this.universalUser = null;
            this.createUserForm.get("name")?.enable();
          } else {
            this.universalUserExists = true;
            this.universalUser = res.universalUsers[0];
            this.createUserForm.patchValue({
              document: this.universalUser.document,
              documentType: this.universalUser.documentType,
              name: this.universalUser.name,
            });
            this.createUserForm.get("name")?.disable();
            this.createUserForm.get("documentType")?.disable();
          }
          this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/users/create"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao consultar a base de usuário.",
            },
          });
        },
      });
  }

  checkLoginExists() {
    const loginCtrl = this.createUserForm.get("login");
    if (!loginCtrl || loginCtrl.invalid) return;

    this.loadingService.show();
    this.userService
      .getUsers("login", loginCtrl.value, null, null, null, "NONE", 0, 1)
      .subscribe({
        next: (res) => {
          this.invalidLogin = res.users.length > 0;
          this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/users/create"], {
            queryParams: {
              action: "ERROR",
              message:
                "Instabilidade ao validar ao login, tente novamente mais tarde",
            },
          });
        },
      });
  }

  checkEmailExists() {
    const emailCtrl = this.createUserForm.get("email");
    if (!emailCtrl || emailCtrl.invalid) return;
    this.loadingService.show();

    this.userService
      .getUsers("email", emailCtrl.value, null, null, null, "NONE", 0, 1)
      .subscribe({
        next: (res) => {
          (this.invalidEmail = res.users.length > 0),
            this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/users/create"], {
            queryParams: {
              action: "ERROR",
              message:
                "Instabilidade ao validar ao login, tente novamente mais tarde",
            },
          });
        },
      });
  }

  // Preenche nickname com a primeira palavra do username
  setNickname() {
    const username: string = this.createUserForm.get("username")?.value || "";
    this.createUserForm.patchValue({ nickname: username.split(" ")[0] });
  }

  // Marca controles inválidos
  private markInvalidControls() {
    this.invalidDocument =
      this.createUserForm.get("document")?.invalid ?? false;
    this.invalidName = this.createUserForm.get("name")?.invalid ?? false;
    this.invalidUsername =
      this.createUserForm.get("username")?.invalid ?? false;
    this.invalidLogin = this.createUserForm.get("login")?.invalid ?? false;
    this.invalidNickname =
      this.createUserForm.get("nickname")?.invalid ?? false;
    this.invalidEmail = this.createUserForm.get("email")?.invalid ?? false;
  }

  // Salva e redireciona
  saveUser() {
    this.markInvalidControls();
    if (this.createUserForm.invalid || this.invalidEmail || this.invalidLogin)
      return;

    this.loadingService.show();

    const userRequest: UserCreateRequest = {
      universalUser: { id: this.universalUser?.id ?? 0 },
      company: { id: this.selectedCompany?.id ?? null },
      department: { id: this.selectedDepartment?.id ?? null },
      login: this.createUserForm.get("login")?.value,
      username: this.createUserForm.get("username")?.value,
      nickname: this.createUserForm.get("nickname")?.value,
      email: this.createUserForm.get("email")?.value,
    };

    if (this.universalUser) {
      // Já existe universalUser
      this.userService.createUser(userRequest).subscribe({
        next: () => this.onSaveSuccess(),
        error: () => this.onSaveError(),
      });
    } else {
      // Cria universalUser antes do user
      const uuRequest: UniversalUserCreateRequest = {
        documentType: this.createUserForm.get("documentType")?.value,
        document: this.createUserForm.get("document")?.value,
        name: this.createUserForm.get("name")?.value,
      };
      this.universalUserService.createUniversalUser(uuRequest).subscribe({
        next: (uuRes) => {
          userRequest.universalUser.id = uuRes.id;
          this.userService.createUser(userRequest).subscribe({
            next: () => this.onSaveSuccess(),
            error: () => this.onSaveError(),
          });
        },
        error: () => this.onSaveError(),
      });
    }
  }

  private onSaveSuccess() {
    this.loadingService.hide();
    this.router.navigate(["/users"], {
      queryParams: {
        action: "SUCCESS",
        message: "Usuário Cadastrado com Sucesso",
      },
    });
  }

  private onSaveError() {
    this.loadingService.hide();
    this.router.navigate(["/users"], {
      queryParams: {
        action: "ERROR",
        message: "Erro ao Cadastrar Usuário, tente novamente.",
      },
    });
  }

  onSelectCompany(company: CompanyResponse | null) {
    this.selectedCompany = company;
  }
  onSelectDepartment(department: DepartmentResponse | null) {
    this.selectedDepartment = department;
  }
}
