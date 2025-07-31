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

  invalidCompanyName = false;
  invalidCompanyDisplayName = false;
  invalidCompanyTradingName = false;
  invalidCompanyContact = false;

  cantSubmit: boolean = true;

  //Image Variables
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
      companyAlias: ["", [Validators.required, Validators.maxLength(32)]],
      companyTradingName: ["", [Validators.maxLength(128)]],
      companyDocument: [
        "",
        [Validators.required, Validators.pattern(/^\d{14}$/)],
      ],
      companyContact: ["", [Validators.required, Validators.email]],
    });

    this.companyForm.statusChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  ngOnInit() {
    this.loadingService.show();
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      // Tratar caso o id não exista
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

        if (company.logoUri !== null) {
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
        this.router.navigate(["/companies"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar empresa",
          },
        });
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
          switch (field) {
            case "name":
              this.invalidCompanyName = exists;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = exists;
              break;
          }
          this.updateFormValidity();
        },
        error: () => {
          switch (field) {
            case "name":
              this.invalidCompanyName = true;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = true;
              break;
          }
          this.updateFormValidity();
        },
      });
  }

  private updateFormValidity() {
    const someInvalid =
      this.invalidCompanyName ||
      this.invalidCompanyTradingName ||
      this.companyForm.invalid;
    this.cantSubmit = someInvalid;
  }

  editCompany() {
    if (this.cantSubmit || this.companyForm.invalid) {
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

    this.companyService.updateCompany(this.selectedCompany!.id.toString(), companyRequest).subscribe({
      next: (response) => {
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

  private navigateSuccess(): void {
    this.router.navigate(["/companies"], {
      queryParams: {
        action: "SUCCESS",
        message: `Empresa ${this.selectedCompany?.id} atualizada com sucesso`,
      },
    });
  }

  private markAllFieldsAsTouched() {
    Object.values(this.companyForm.controls).forEach((control) => {
      control.markAsTouched();
    });
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
