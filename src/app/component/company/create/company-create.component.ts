import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ImageCroppedEvent, ImageCropperComponent } from "ngx-image-cropper";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { finalize } from "rxjs";

@Component({
  selector: "company-create",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: "./company-create.component.html",
  styleUrls: ["./company-create.component.scss"],
})
export class CompanyCreateComponent {
  companyForm!: FormGroup;

  // flags de API (duplicados)
  invalidCompanyName = false;
  invalidCompanyAlias = false;
  invalidCompanyTradingName = false;
  invalidCompanyDocument = false;

  // Controle de logo
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

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private loadingService: LoadingService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.companyForm = this.formBuilder.group({
      companyName: ["", [Validators.required, Validators.maxLength(256)]],
      companyDisplayName: [
        "",
        [Validators.required, Validators.maxLength(128)],
      ],
      companyAlias: ["", [Validators.required, Validators.maxLength(32)]],
      companyTradingName: ["", [Validators.maxLength(128)]],
      companyDocument: [
        "",
        [Validators.required, Validators.pattern(/^\d{14}$/)],
      ],
      companyContact: ["", [Validators.required, Validators.email]],
    });
  }

  ngAfterViewInit() {
    this.cropperModalInstance = new (window as any).bootstrap.Modal(
      this.cropperModal.nativeElement,
      { backdrop: "static", keyboard: false }
    );
  }

  ngOnDestroy() {
    this.cropperModalInstance?.dispose();
  }

  validateCompanyExists(field: "name" | "alias" | "tradingName" | "document") {
    const control = this.companyForm.get(this.getFormControlName(field));
    const value = control?.value?.trim();

    if (!value || !control?.valid) return;

    this.loadingService.show();

    this.companyService
      .getCompanies(field, value, "ACTIVE", 0, 1)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (res) => {
          const exists = res.companies.length > 0;
          switch (field) {
            case "name":
              this.invalidCompanyName = exists;
              break;
            case "alias":
              this.invalidCompanyAlias = exists;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = exists;
              break;
            case "document":
              this.invalidCompanyDocument = exists;
              break;
          }
        },
        error: () => {
          switch (field) {
            case "name":
              this.invalidCompanyName = true;
              break;
            case "alias":
              this.invalidCompanyAlias = true;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = true;
              break;
            case "document":
              this.invalidCompanyDocument = true;
              break;
          }
        },
      });
  }

  submitCompany() {
    if (
      this.companyForm.invalid ||
      this.invalidCompanyName ||
      this.invalidCompanyAlias ||
      this.invalidCompanyTradingName ||
      this.invalidCompanyDocument
    ) {
      this.markAllFieldsAsTouched();
      return;
    }

    const companyRequest = {
      name: this.companyForm.value.companyName.trim(),
      alias: this.companyForm.value.companyAlias.trim(),
      tradingName: this.companyForm.value.companyTradingName?.trim() || "",
      displayName: this.companyForm.value.companyDisplayName.trim(),
      document: this.companyForm.value.companyDocument.trim(),
      contact: this.companyForm.value.companyContact.trim(),
    };

    this.loadingService.show();

    this.companyService.createCompany(companyRequest).subscribe({
      next: (response) => {
        const companyId = response.id;

        if (this.logoIsSelected) {
          this.companyService
            .updateCompanyLogo(
              companyId.toString(),
              this.croppedBlob!,
              this.imageName!
            )
            .pipe(
              finalize(() => {
                this.loadingService.hide();
                this.navigateSuccess(companyId.toString());
              })
            )
            .subscribe({
              error: () => {
                this.router.navigate([], {
                  queryParams: {
                    action: "ERROR",
                    message:
                      "Empresa cadastrada, mas houve erro ao enviar o logo.",
                  },
                });
              },
            });
        } else {
          this.loadingService.hide();
          this.navigateSuccess(companyId.toString());
        }
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao cadastrar empresa",
          },
        });
      },
    });
  }

  private navigateSuccess(companyId: string) {
    this.router.navigate(["/companies"], {
      queryParams: {
        action: "SUCCESS",
        message: `Empresa ${companyId} cadastrada com sucesso`,
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
      case "alias":
        return "companyAlias";
      case "tradingName":
        return "companyTradingName";
      case "document":
        return "companyDocument";
      default:
        return "";
    }
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
    this.logoIsSelected = false;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl!);
    this.croppedBlob = event.blob!;
    console.log(
      "Tamanho do blob recortado:",
      this.croppedBlob.size / 1024,
      "KB"
    );
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
