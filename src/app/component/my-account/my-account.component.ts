import { Component, ElementRef, ViewChild } from "@angular/core";
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
import { ImageCropperComponent } from "ngx-image-cropper";

declare var bootstrap: any;

@Component({
  selector: "app-my-account",
  imports: [RouterModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: "./my-account.component.html",
  standalone: true,
  styleUrl: "./my-account.component.scss",
})
export class MyAccountComponent {
  myUser: UserResponse | null = null;
  myRoles: RolesResponse | null = null;

  mainProfileForm!: FormGroup;

  invalidUsername: boolean = false;
  invalidNickname: boolean = false;

  croppedImage: string | null = null;
  imageChangedEvent: any = "";
  private cropperModal: any;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    public sessionService: SessionService,
    private userService: UserService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router
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
    // Inicializa o modal Bootstrap via JS
    const modalEl = document.getElementById("cropperModal");
    if (modalEl) {
      this.cropperModal = new bootstrap.Modal(modalEl);
    }
  }

  getRolesAsText() {
    return this.myRoles?.roles.map((role) => role.name).join(", ") ?? "";
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

  //Cropper Functions

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    // Abre o modal
    this.cropperModal.show();
  }

  imageCropped(event: any) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    // Imagem carregada no cropper
  }

  cropperReady() {
    // Cropper pronto para uso
  }

  loadImageFailed() {
    alert("Falha ao carregar imagem. Tente outro arquivo.");
  }

  cancelCrop() {
    this.croppedImage = null;
    this.imageChangedEvent = null;
    // Limpa input para permitir reupload da mesma imagem
    this.fileInput.nativeElement.value = "";
  }

  confirmCrop() {
    if (this.croppedImage) {
      // Atualiza a imagem do perfil localmente
      if (this.myUser && this.myUser.id !== undefined && this.croppedImage) {
        this.myUser = {
          ...this.myUser,
          avatarUri: this.croppedImage,
        };
      }
    }
    this.cropperModal.hide();
    this.cancelCrop();
  }
}
