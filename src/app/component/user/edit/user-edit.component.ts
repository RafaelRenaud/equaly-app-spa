import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  NgbModal,
  NgbModalModule,
  NgbTooltipModule,
} from "@ng-bootstrap/ng-bootstrap";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { forkJoin, Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from "rxjs/operators";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { RolesResponse } from "../../../core/model/role/roles-response.model";
import { UserEditRequest } from "../../../core/model/user/user-edit-request.model";
import { UserResponse } from "../../../core/model/user/user-response.model";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { SessionService } from "../../../core/service/session/session.service";
import { UserService } from "../../../core/service/user/user.service";
import { DepartmentSearchComponent } from "../../department/search/department-search.component";

@Component({
  selector: "app-user-edit",
  imports: [
    ReactiveFormsModule,
    RouterModule,
    NgbModalModule,
    NgbTooltipModule,
    ImageCropperComponent,
    DepartmentSearchComponent
  ],
  templateUrl: "./user-edit.component.html",
  styleUrl: "./user-edit.component.scss",
  standalone: true,
})
export class UserEditComponent implements OnInit {
  user: UserResponse | null = null;
  userRoles: RolesResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;
  editUserForm!: FormGroup;

  isEqualyMasterAdmin = false;
  rolesSelected = false;

  invalidUsername = false;
  invalidLogin = false;
  invalidNickname = false;
  invalidEmail = false;
  invalidAvatar = false;

  fileType: "png" | "jpeg" = "png";
  imageChangedEvent: Event | null = null;
  imageName: string | null = null;
  croppedImage: SafeUrl = "";
  croppedBlob: Blob | null = null;
  avatarSelected = false;

  @ViewChild("cropperModal", { static: false }) cropperModal!: TemplateRef<any>;

  constructor(
    private sessionService: SessionService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.editUserForm = this.formBuilder.group({
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
        {
          validators: [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(32),
          ],
          asyncValidators: [this.duplicateLoginValidator.bind(this)],
          updateOn: "blur",
        },
      ],
      nickname: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(32),
        ],
      ],
      email: [
        "",
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.duplicateEmailValidator.bind(this)],
          updateOn: "blur",
        },
      ],
      roles: this.formBuilder.array([], Validators.required),
    });

    if (this.sessionService.hasRole("EQUALY_MASTER_ADMIN")) {
      this.isEqualyMasterAdmin = true;
    }

    const userId = this.route.snapshot.paramMap.get("id");
    if (userId) {
      this.loadUserData(userId);
    } else {
      this.router.navigate(["/users"]);
    }

    this.editUserForm.valueChanges.subscribe(() => this.validateFields());
  }

  duplicateLoginValidator(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 4 || !this.user) {
      return of(null);
    }

    if (control.value === this.user.login) {
      return of(null);
    }

    this.loadingService.show();

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((login) => {
        return this.userService.getUsers("login", login, null, null, null, "NONE", null, 0, 1);
      }),
      map((response) => {
        const exists = response.users.some((u) => u.login === control.value && u.id !== this.user!.id);
        return exists ? { duplicateLogin: true } : null;
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  duplicateEmailValidator(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!control.value || !control.value.includes('@') || !this.user) {
      return of(null);
    }

    if (control.value === this.user.email) {
      return of(null);
    }

    this.loadingService.show();

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((email) => {
        return this.userService.getUsers("email", email, null, null, null, "NONE", null, 0, 1);
      }),
      map((response) => {
        const exists = response.users.some((u) => u.email === control.value && u.id !== this.user!.id);
        return exists ? { duplicateEmail: true } : null;
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  private loadUserData(userId: string) {
    this.loadingService.show();

    forkJoin({
      user: this.userService.getUser(userId),
      roles: this.userService.getUserRoles(userId),
    }).subscribe({
      next: ({ user, roles }) => {
        this.user = user;
        this.userRoles = roles;

        if (user.department) {
          this.selectedDepartment = {
            id: user.department.id,
            name: user.department.name,
            company: user.company,
            description: "",
            status: "ACTIVE",
            audit: {
              createdAt: new Date().toISOString(),
              createdBy: "system",
              updatedAt: null,
              updatedBy: null,
              disabledAt: null,
              disabledBy: null,
            },
          };
        }

        this.editUserForm.patchValue({
          username: user.username || "",
          login: user.login || "",
          nickname: user.nickname || "",
          email: user.email || "",
        });

        if (roles.roles && roles.roles.length > 0) {
          const rolesArray = this.editUserForm.get("roles") as FormArray;
          roles.roles.forEach((role) => {
            rolesArray.push(this.formBuilder.control(role.name));
          });
          this.rolesSelected = true;
        }

        this.loadingService.hide();
      },
      error: (error) => {
        console.error("Erro ao carregar dados do usuário:", error);
        this.loadingService.hide();
        this.router.navigate(["/users"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar dados do usuário",
          },
        });
      },
    });
  }

  private validateFields() {
    this.invalidUsername = this.isFieldInvalid("username");
    this.invalidLogin = this.isFieldInvalid("login");
    this.invalidNickname = this.isFieldInvalid("nickname");
    this.invalidEmail = this.isFieldInvalid("email");
  }

  private isFieldInvalid(controlName: string): boolean {
    const control = this.editUserForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  checkLoginExists() {
    const loginCtrl = this.editUserForm.get("login");
    if (!loginCtrl || loginCtrl.invalid || !this.user) return;

    if (loginCtrl.value === this.user.login) {
      this.invalidLogin = false;
      return;
    }

    this.loadingService.show();
    this.userService
      .getUsers("login", loginCtrl.value, null, null, null, "NONE", null, 0, 1)
      .subscribe({
        next: (res) => {
          this.invalidLogin = res.users.some(
            (user) =>
              user.login === loginCtrl.value && user.id !== this.user!.id
          );
        },
        error: () => this.handleValidationError("Erro ao validar login."),
        complete: () => this.loadingService.hide(),
      });
  }

  checkEmailExists() {
    const emailCtrl = this.editUserForm.get("email");
    if (!emailCtrl || emailCtrl.invalid || !this.user) return;

    if (emailCtrl.value === this.user.email) {
      this.invalidEmail = false;
      return;
    }

    this.loadingService.show();
    this.userService
      .getUsers("email", emailCtrl.value, null, null, null, "NONE", null, 0, 1)
      .subscribe({
        next: (res) => {
          this.invalidEmail = res.users.some(
            (user) =>
              user.email === emailCtrl.value && user.id !== this.user!.id
          );
        },
        error: () => this.handleValidationError("Erro ao validar email."),
        complete: () => this.loadingService.hide(),
      });
  }

  private handleValidationError(message: string) {
    this.loadingService.hide();
    this.router.navigate(["/users"], {
      queryParams: { action: "ERROR", message },
    });
  }

  hasRole(roleName: string): boolean {
    return (
      this.userRoles?.roles.some((role) => role.name === roleName) || false
    );
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
    return this.editUserForm.get("roles") as FormArray;
  }

  private markInvalidControls() {
    this.invalidUsername = this.isFieldInvalid("username");
    this.invalidLogin = this.isFieldInvalid("login");
    this.invalidNickname = this.isFieldInvalid("nickname");
    this.invalidEmail = this.isFieldInvalid("email");
  }

  get canSubmit(): boolean {
    return (
      this.editUserForm.valid &&
      !this.invalidEmail &&
      !this.invalidLogin &&
      !this.editUserForm.pending
    );
  }

  updateUser() {
    this.markInvalidControls();
    if (!this.canSubmit || !this.user) return;

    this.loadingService.show();

    const userRequest: UserEditRequest = {
      department: {
        id: this.selectedDepartment?.id || null,
      },
      login: this.editUserForm.get("login")?.value,
      username: this.editUserForm.get("username")?.value,
      nickname: this.editUserForm.get("nickname")?.value,
      email: this.editUserForm.get("email")?.value,
    };

    this.userService.updateUser(this.user.id, userRequest).subscribe({
      next: () => {
        if (this.rolesSelected) {
          this.updateUserRoles(this.user!.id, this.roles);
        } else {
          if (this.avatarSelected && this.croppedBlob && this.imageName) {
            this.updateUserAvatar(
              this.user!.id,
              this.croppedBlob,
              this.imageName
            );
          } else {
            this.onUpdateSuccess();
          }
        }
      },
      error: () => this.onUpdateError(),
    });
  }

  updateUserRoles(id: number, roles: FormArray) {
    this.userService.createUserRole(id, roles.value).subscribe({
      next: () => {
        if (this.avatarSelected && this.croppedBlob && this.imageName) {
          this.updateUserAvatar(id, this.croppedBlob, this.imageName);
        } else {
          this.onUpdateSuccess();
        }
      },
      error: () => this.onUpdateError(),
    });
  }

  updateUserAvatar(id: number, blob: Blob, blobName: string) {
    if (blob.size > 2 * 1024 * 1024) {
      this.invalidAvatar = true;
      this.loadingService.hide();
      return;
    }

    this.userService.updateUserAvatar(id.toString(), blob, blobName).subscribe({
      next: () => this.onUpdateSuccess(),
      error: () => this.onUpdateError(),
    });
  }

  private onUpdateSuccess() {
    this.loadingService.hide();
    this.router.navigate(["/users"], {
      queryParams: {
        action: "SUCCESS",
        message: "Usuário Atualizado com Sucesso",
      },
    });
  }

  private onUpdateError() {
    this.loadingService.hide();
    this.router.navigate(["/users"], {
      queryParams: {
        action: "ERROR",
        message: "Erro ao Atualizar Usuário, tente novamente.",
      },
    });
  }

  onSelectDepartment(department: DepartmentResponse | null) {
    this.selectedDepartment = department;
  }

  fileChangeEvent(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      this.invalidAvatar = true;
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
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