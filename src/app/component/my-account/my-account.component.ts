import { Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { SessionService } from "../../core/service/session/session.service";
import { UserService } from "../../core/service/user/user.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { UserResponse } from "../../core/model/user/user-response.model";
import { RolesResponse } from "../../core/model/role/roles-response.model";
import { forkJoin } from "rxjs";
import { Router, RouterModule } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MainProfile } from "../../core/model/user/main-profile.model";
import { LoginService } from "../../core/service/login/login.service";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { RecoveryService } from "../../core/service/recovery/recovery.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-my-account",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: "./my-account.component.html",
  styleUrl: "./my-account.component.scss",
})
export class MyAccountComponent implements OnInit {
  myUser: UserResponse | null = null;
  myRoles: RolesResponse | null = null;
  fileType: "png" | "jpeg" = "png";

  mainProfileForm!: FormGroup;

  invalidUsername: boolean = false;
  invalidNickname: boolean = false;
  invalidAvatar: boolean = false;
  invalidRecovery: boolean = false;

  imageChangedEvent: Event | null = null;
  imageName: string | null = null;
  croppedImage: SafeUrl = "";
  croppedBlob: Blob | null = null;

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  isCropperVisible = false;

  private cropperModalRef?: NgbModalRef;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private recoveryService: RecoveryService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) {
    this.mainProfileForm = this.formBuilder.group({
      username: ["", [Validators.minLength(8), Validators.maxLength(64)]],
      nickname: ["", [Validators.minLength(4), Validators.maxLength(32)]],
    });
  }

  ngOnInit(): void {
    this.loadingService.show();

    const userId = this.sessionService.getItem("userId")!;

    forkJoin({
      user: this.userService.getUser(userId),
      roles: this.userService.getUserRoles(userId),
    }).subscribe({
      next: ({ user, roles }) => {
        this.myUser = user;
        this.myRoles = roles;
        this.mainProfileForm.patchValue({
          username: user.username,
          nickname: user.nickname,
        });
        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao carregar dados do usuário ou roles:", err);
        this.loadingService.hide();
      },
    });
  }

  openModal(content: any, options: any = {}) {
    return this.modalService.open(content, { centered: true, ...options });
  }

  sendRAC() {
    this.invalidRecovery = false;
    this.loadingService.show();
    this.recoveryService
      .sendRAC({
        companyAlias: this.sessionService.getItem("companyAlias")!,
        login: this.myUser?.login!,
      })
      .subscribe({
        next: () => {
          this.loginService.logout();
        },
        error: (err) => {
          console.error("Erro ao enviar RAC:", err);
          this.invalidRecovery = true;
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.value = "";
    this.fileInput.nativeElement.click();
  }

  fileChangeEvent(event: any, cropperModalTemplate: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageName = file.name;
      if (file.type === "image/png") {
        this.fileType = "png";
      } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
        this.fileType = "jpeg";
      } else {
        this.fileType = "png";
      }

      this.imageChangedEvent = event;
      this.openCropperModal(cropperModalTemplate);
    }
  }

  openCropperModal(content: any) {
    this.isCropperVisible = false;
    this.cropperModalRef = this.modalService.open(content, {
      size: "lg",
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
    // Exibe o cropper imediatamente
    this.isCropperVisible = true;
  }

  closeCropperModal() {
    this.isCropperVisible = false;
    this.cropperModalRef?.close();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.croppedBlob = event.blob!;
    console.log(
      "Tamanho do blob recortado:",
      this.croppedBlob.size / 1024,
      "KB"
    );
  }

  loadImageFailed() {
    this.invalidAvatar = true;
    this.closeCropperModal();
  }

  saveCroppedImage() {
    this.loadingService.show();
    this.userService
      .updateUserAvatar(
        this.sessionService.getItem("userId")!,
        this.croppedBlob!,
        this.imageName!
      )
      .subscribe({
        next: (res) => {
          const params = new URLSearchParams({
            action: "SUCCESS",
            message: "Foto de perfil atualizada com sucesso.",
          });

          this.sessionService.updateSessionAvatar(res.uri);
          window.location.href =
            window.location.pathname + "?" + params.toString();
          this.loadingService.hide();
        },
        error: (err) => {
          this.invalidAvatar = true;
          this.loadingService.hide();
        },
      });
    this.closeCropperModal();
  }

  updateProfile() {
    this.loadingService.show();
    this.invalidNickname = false;
    this.invalidUsername = false;

    if (this.mainProfileForm.invalid) {
      if (this.mainProfileForm.get("username")?.invalid) {
        this.invalidUsername = true;
      }
      if (this.mainProfileForm.get("nickname")?.invalid) {
        this.invalidNickname = true;
      }
      this.loadingService.hide();
    } else {
      const profileDto: MainProfile = this.mainProfileForm.value as MainProfile;

      this.userService
        .updateUserProfile(this.sessionService.getItem("userId")!, profileDto)
        .subscribe({
          next: () => {
            this.loginService.logout();
            this.loadingService.hide();
            this.router.navigate(["/login"]);
          },
          error: (err) => {
            console.error("Erro ao chamar API de Atualização de Perfil: ", err);
            this.loadingService.hide();
          },
        });
    }
  }

  getRolesAsText() {
    return this.myRoles?.roles.map((role) => role.name).join(", ") ?? "";
  }
}
