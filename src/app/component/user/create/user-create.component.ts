import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import { DepartmentSearchComponent } from "../../department/search/department-search.component";
import { SessionService } from "../../../core/service/session/session.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { UniversalUserService } from "../../../core/service/user/universal-user.service";
import { UserService } from "../../../core/service/user/user.service";
import { Router, RouterModule } from "@angular/router";
import { UniversalUserResponse } from "../../../core/model/user/universal-user.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { UserCreateRequest } from "../../../core/model/user/user-create-request.model";
import { UniversalUserCreateRequest } from "../../../core/model/user/universal-user-create-request.model";
import {
  NgbModal,
  NgbModalModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";

@Component({
  selector: "app-user-create",
  imports: [
    CompanySearchComponent,
    DepartmentSearchComponent,
    ReactiveFormsModule,
    RouterModule,
    NgbTooltipModule,
    NgbModalModule,
    ImageCropperComponent,
  ],
  templateUrl: "./user-create.component.html",
  styleUrl: "./user-create.component.scss",
  standalone: true,
})
export class UserCreateComponent implements OnInit {
  isEqualyMasterAdmin = false;
  universalUserExists = false;
  rolesSelected = false;
  avatarSelected = false;
  universalUser: UniversalUserResponse | null = null;
  selectedCompany: CompanyResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;
  createUserForm!: FormGroup;

  // Flags de validação
  invalidDocument = false;
  invalidName = false;
  invalidUsername = false;
  invalidLogin = false;
  invalidNickname = false;
  invalidEmail = false;
  invalidAvatar = false;

  // Upload de avatar
  fileType: "png" | "jpeg" = "png";
  imageChangedEvent: Event | null = null;
  imageName: string | null = null;
  croppedImage: SafeUrl = "";
  croppedBlob: Blob | null = null;

  @ViewChild("cropperModal", { static: false }) cropperModal!: TemplateRef<any>;

  constructor(
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private universalUserService: UniversalUserService,
    private userService: UserService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.createUserForm = this.formBuilder.group({
      documentType: ["NONE", Validators.required],
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
      roles: this.formBuilder.array([], Validators.required),
    });

    if (this.sessionService.hasRole("EQUALY_MASTER_ADMIN")) {
      this.isEqualyMasterAdmin = true;
    }

    // Atualiza flags de validação quando o form mudar
    this.createUserForm.valueChanges.subscribe(() => this.validateFields());
  }

  private validateFields() {
    this.invalidDocument = this.isFieldInvalid("document");
    this.invalidName = this.isFieldInvalid("name");
    this.invalidUsername = this.isFieldInvalid("username");
    this.invalidLogin = this.isFieldInvalid("login");
    this.invalidNickname = this.isFieldInvalid("nickname");
    this.invalidEmail = this.isFieldInvalid("email");
  }

  private isFieldInvalid(controlName: string): boolean {
    const control = this.createUserForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

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
            this.createUserForm.get("documentType")?.enable();
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
        error: () => this.handleValidationError("Erro ao consultar usuário."),
      });
  }

  checkLoginExists() {
    const loginCtrl = this.createUserForm.get("login");
    if (!loginCtrl || loginCtrl.invalid) return;

    this.loadingService.show();
    this.userService
      .getUsers("login", loginCtrl.value, null, null, null, "NONE", 0, 1)
      .subscribe({
        next: (res) => (this.invalidLogin = res.users.length > 0),
        error: () => this.handleValidationError("Erro ao validar login."),
        complete: () => this.loadingService.hide(),
      });
  }

  checkEmailExists() {
    const emailCtrl = this.createUserForm.get("email");
    if (!emailCtrl || emailCtrl.invalid) return;

    this.loadingService.show();
    this.userService
      .getUsers("email", emailCtrl.value, null, null, null, "NONE", 0, 1)
      .subscribe({
        next: (res) => (this.invalidEmail = res.users.length > 0),
        error: () => this.handleValidationError("Erro ao validar email."),
        complete: () => this.loadingService.hide(),
      });
  }

  private handleValidationError(message: string) {
    this.loadingService.hide();
    this.router.navigate(["/users/create"], {
      queryParams: { action: "ERROR", message },
    });
  }

  setNickname() {
    const username: string = this.createUserForm.get("username")?.value || "";
    this.createUserForm.patchValue({ nickname: username.split(" ")[0] });
  }

  private markInvalidControls() {
    this.invalidDocument = this.isFieldInvalid("document");
    this.invalidName = this.isFieldInvalid("name");
    this.invalidUsername = this.isFieldInvalid("username");
    this.invalidLogin = this.isFieldInvalid("login");
    this.invalidNickname = this.isFieldInvalid("nickname");
    this.invalidEmail = this.isFieldInvalid("email");
  }

  get canSubmit(): boolean {
    return (
      this.createUserForm.valid && !this.invalidEmail && !this.invalidLogin
    );
  }

  saveUser() {
    this.markInvalidControls();
    if (!this.canSubmit) return;

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
      this.createUser(userRequest);
    } else {
      const uuRequest: UniversalUserCreateRequest = {
        documentType: this.createUserForm.get("documentType")?.value,
        document: this.createUserForm.get("document")?.value,
        name: this.createUserForm.get("name")?.value,
      };
      this.createUniversalUserAndUser(userRequest, uuRequest);
    }
  }

  createUniversalUserAndUser(
    userRequest: UserCreateRequest,
    universalUserRequest: UniversalUserCreateRequest
  ) {
    this.universalUserService
      .createUniversalUser(universalUserRequest)
      .subscribe({
        next: (uuRes) => {
          userRequest.universalUser.id = uuRes.id;
          this.createUser(userRequest);
        },
        error: () => this.onSaveError(),
      });
  }

  createUser(userRequest: UserCreateRequest) {
    this.userService.createUser(userRequest).subscribe({
      next: (response) => {
        if (this.rolesSelected) this.createUserRoles(response.id, this.roles);

        if (this.avatarSelected && this.croppedBlob && this.imageName) {
          this.createUserAvatar(response.id, this.croppedBlob, this.imageName);
        } else {
          this.onSaveSuccess();
        }
      },
      error: () => this.onSaveError(),
    });
  }

  createUserRoles(id: number, roles: FormArray) {
    this.userService.createUserRole(id, roles.value).subscribe({
      next: () => {
        if (!this.avatarSelected) this.onSaveSuccess();
      },
      error: () => this.onSaveError(),
    });
  }

  createUserAvatar(id: number, blob: Blob, blobName: string) {
    if (blob.size > 2 * 1024 * 1024) {
      // valida 2MB
      this.invalidAvatar = true;
      this.loadingService.hide();
      return;
    }

    this.userService.updateUserAvatar(id.toString(), blob, blobName).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
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

  onCheckboxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      this.roles.push(this.formBuilder.control(value));
    } else {
      const index = this.roles.controls.findIndex((x) => x.value === value);
      this.roles.removeAt(index);
    }

    this.rolesSelected = this.roles.length > 0;
  }

  get roles(): FormArray {
    return this.createUserForm.get("roles") as FormArray;
  }

  fileChangeEvent(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      this.invalidAvatar = true;
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      this.invalidAvatar = true;
      return;
    }

    this.invalidAvatar = false;
    this.imageName = file.name;
    this.fileType =
      file.type.includes("jpeg") || file.type.includes("jpg") ? "jpeg" : "png";
    this.imageChangedEvent = event;
    this.modalService.open(this.cropperModal, {
      ariaLabelledBy: "cropperModal",
    });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.croppedBlob = event.blob!;
    this.avatarSelected = true;
  }

  removeAvatar() {
    this.avatarSelected = false;
    this.croppedImage = "";
    this.croppedBlob = null;
  }

  loadImageFailed() {
    this.invalidAvatar = true;
    this.closeCropperModal();
  }

  closeCropperModal() {
    this.modalService.dismissAll();
  }
}
