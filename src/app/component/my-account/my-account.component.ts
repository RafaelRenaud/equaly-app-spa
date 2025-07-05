import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
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
import {
  ImageCroppedEvent,
  ImageCropperComponent,
  LoadedImage,
} from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
  selector: "app-my-account",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: "./my-account.component.html",
  styleUrl: "./my-account.component.scss",
})
export class MyAccountComponent implements AfterViewInit, OnDestroy {
  myUser: UserResponse | null = null;
  myRoles: RolesResponse | null = null;
  fileType: "png" | "jpeg" = "png";

  mainProfileForm!: FormGroup;

  invalidUsername: boolean = false;
  invalidNickname: boolean = false;
  invalidAvatar: boolean = false;

  imageChangedEvent: Event | null = null;
  imageName: string | null = null;
  croppedImage: SafeUrl = "";
  croppedBlob: Blob | null = null;

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild("cropperModal") cropperModal!: ElementRef<HTMLDivElement>;

  isCropperVisible = false;

  // para controle do modal bootstrap via JS
  private cropperModalInstance: any;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private sanitizer: DomSanitizer
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

  ngAfterViewInit() {
    const modalEl = this.cropperModal.nativeElement;
    this.cropperModalInstance = new (window as any).bootstrap.Modal(modalEl, {
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnDestroy() {
    if (this.cropperModalInstance) {
      this.cropperModalInstance.dispose();
    }
  }

  // Abre input file quando clica no overlay
  triggerFileInput() {
    this.fileInput.nativeElement.value = ""; 
    this.fileInput.nativeElement.click();
  }

  fileChangeEvent(event: any): void {
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
      this.openCropperModal();
    }
  }

  openCropperModal() {
    this.isCropperVisible = false;

    const modalEl = this.cropperModal.nativeElement;
    const modal = new (window as any).bootstrap.Modal(modalEl);

    modal.show();

    const onShown = () => {
      this.isCropperVisible = true;
      modalEl.removeEventListener("shown.bs.modal", onShown);
    };
    modalEl.addEventListener("shown.bs.modal", onShown);
  }

  closeCropperModal() {
    this.isCropperVisible = false;
    this.cropperModalInstance?.hide();
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
          this.sessionService.updateSessionAvatar(res.uri);
          window.location.reload();
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
    const modal = document.getElementById("confirmationModal");
    if (modal) {
      (window as any).bootstrap.Modal.getInstance(modal)?.hide();
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }

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
