import { Component, ElementRef, ViewChild } from "@angular/core";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { CompanyService } from "../../../core/service/company/company.service";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { finalize } from "rxjs";

@Component({
  selector: "app-company-edit",
  imports: [ImageCropperComponent, ReactiveFormsModule, RouterModule],
  templateUrl: "./company-edit.component.html",
  styleUrl: "./company-edit.component.scss",
  standalone: true,
})
export class CompanyEditComponent {
  selectedCompany: CompanyResponse | null = null;
  companyForm!: FormGroup;

  // Flags de API
  invalidCompanyName = false;
  invalidCompanyTradingName = false;

  // Flags de validação local
  invalidCompanyDisplayName = false;
  invalidCompanyContact = false;

  // Controle do botão
  cantSubmit: boolean = true;

  // Controle de imagem
  fileType: "png" | "jpeg" = "png";
  imageChangedEvent: Event | null = null;
  imageName: string | null = null;
  croppedImage: SafeUrl = "";
  croppedBlob: Blob | null = null;

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild("cropperModal") cropperModal!: ElementRef<HTMLDivElement>;
  isCropperVisible = false;
  private cropperModalInstance: any;

  invalidLogo: boolean = false;
  logoIsSelected: boolean = false;
  companyHasLogo: boolean = false;

  constructor(
    private companyService: CompanyService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.companyForm = this.formBuilder.group({
      companyName: ["", [Validators.required, Validators.maxLength(256)]],
      companyDisplayName: [
        "",
        [Validators.required, Validators.maxLength(128)],
      ],
      companyAlias: [{ value: "", disabled: true }],
      companyTradingName: ["", [Validators.maxLength(128), Validators.required]],
      companyDocument: [{ value: "", disabled: true }],
      companyContact: ["", [Validators.required, Validators.email]],
    });

    // Observa alterações no form e atualiza o estado do botão
    this.companyForm.statusChanges.subscribe(() => this.updateFormValidity());
  }

  ngOnInit() {
    this.loadingService.show();
    const idParam = this.route.snapshot.paramMap.get("id");

    if (!idParam) {
      this.router.navigate(["/companies"], {
        queryParams: {
          action: "ERROR",
          message: "ID da empresa inválido",
        },
      });
      return;
    }

    const id = +idParam;
    this.companyService.getCompany(id).subscribe({
      next: (company: CompanyResponse) => {
        this.selectedCompany = company;

        if (company.logoUri) {
          this.companyHasLogo = true;
        }

        this.companyForm.patchValue({
          companyName: company.name,
          companyDisplayName: company.displayName,
          companyAlias: company.alias,
          companyTradingName: company.tradingName,
          companyDocument: company.document,
          companyContact: company.contact,
        });

        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(["/companies"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar empresa",
          },
        });
      },
    });
  }

  validateCompanyExists(field: "name" | "tradingName") {
    const control = this.companyForm.get(this.getFormControlName(field));
    const value = control?.value?.trim();

    if (!value || !control?.valid) return;

    this.loadingService.show();

    this.companyService
      .getCompanies(field, value, "ACTIVE", 0, 1)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (res) => {
          const exists =
            res.companies.length > 0 &&
            res.companies[0].id !== this.selectedCompany?.id;

          if (field === "name") this.invalidCompanyName = exists;
          if (field === "tradingName") this.invalidCompanyTradingName = exists;

          this.updateFormValidity();
        },
        error: () => {
          if (field === "name") this.invalidCompanyName = true;
          if (field === "tradingName") this.invalidCompanyTradingName = true;

          this.updateFormValidity();
        },
      });
  }

  private updateFormValidity() {
    // validações locais
    this.invalidCompanyDisplayName =
      this.companyForm.get("companyDisplayName")?.invalid ?? false;

    this.invalidCompanyContact =
      this.companyForm.get("companyContact")?.invalid ?? false;

    // botão só libera se tudo estiver ok
    this.cantSubmit =
      this.companyForm.invalid ||
      this.invalidCompanyName ||
      this.invalidCompanyTradingName ||
      this.invalidCompanyDisplayName ||
      this.invalidCompanyContact;
  }

  editCompany() {
    if (this.cantSubmit) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.loadingService.show();

    const companyRequest = {
      name: this.companyForm.value.companyName.trim(),
      tradingName: this.companyForm.value.companyTradingName.trim(),
      displayName: this.companyForm.value.companyDisplayName.trim(),
      contact: this.companyForm.value.companyContact.trim(),
    };

    this.companyService
      .updateCompany(this.selectedCompany!.id.toString(), companyRequest)
      .subscribe({
        next: () => {
          if (this.logoIsSelected) {
            this.companyService
              .updateCompanyLogo(
                this.selectedCompany!.id.toString(),
                this.croppedBlob!,
                this.imageName!
              )
              .pipe(
                finalize(() => {
                  this.loadingService.hide();
                  this.navigateSuccess();
                })
              )
              .subscribe({
                error: () => {
                  this.router.navigate([], {
                    queryParams: {
                      action: "ERROR",
                      message:
                        "Empresa atualizada, mas houve erro ao enviar o logo.",
                    },
                  });
                },
              });
          } else {
            this.loadingService.hide();
            this.navigateSuccess();
          }
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao atualizar empresa",
            },
          });
        },
      });
  }

  private navigateSuccess() {
    this.router.navigate(["/companies"], {
      queryParams: {
        action: "SUCCESS",
        message: `Empresa ${this.selectedCompany?.id} atualizada com sucesso`,
      },
    });
  }

  private markAllFieldsAsTouched() {
    Object.values(this.companyForm.controls).forEach((c) => c.markAsTouched());
  }

  private getFormControlName(field: string): string {
    switch (field) {
      case "name":
        return "companyName";
      case "tradingName":
        return "companyTradingName";
      default:
        return "";
    }
  }

  // Cropper
  fileChangeEvent(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imageName = file.name;
      this.fileType =
        file.type === "image/png"
          ? "png"
          : file.type === "image/jpeg" || file.type === "image/jpg"
          ? "jpeg"
          : "png";
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
    this.logoIsSelected = false;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.croppedBlob = event.blob!;
    this.logoIsSelected = true;
  }

  removeLogo() {
    this.logoIsSelected = false;
    this.croppedImage = "";
    this.croppedBlob = null;
  }

  loadImageFailed() {
    this.invalidLogo = true;
    this.closeCropperModal();
  }
}
