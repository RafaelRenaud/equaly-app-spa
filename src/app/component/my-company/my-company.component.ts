import { Component } from "@angular/core";
import { CompanyResponse } from "../../core/model/company/company-response.model";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { SessionService } from "../../core/service/session/session.service";
import { CompanyService } from "../../core/service/company/company.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
import { finalize } from "rxjs";
import { LoginService } from "../../core/service/login/login.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserSystemPipe } from "../../pipe/user-system-pipe";

@Component({
  selector: "app-my-company",
  imports: [RouterModule, ReactiveFormsModule, UserSystemPipe],
  templateUrl: "./my-company.component.html",
  styleUrls: ["./my-company.component.scss"],
  standalone: true,
})
export class MyCompanyComponent {
  myCompany: CompanyResponse | null = null;
  companyForm!: FormGroup;

  invalidCompanyName = false;
  invalidCompanyDisplayName = false;
  invalidCompanyTradingName = false;
  invalidCompanyContact = false;

  cantSubmit: boolean = true;
  viewOnly = true;

  constructor(
    public sessionService: SessionService,
    private companyService: CompanyService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadingService.show();
    const companyId = this.sessionService.getItem("companyId")!;

    this.companyForm = this.formBuilder.group({
      companyName: ["", [Validators.required, Validators.maxLength(256)]],
      companyDisplayName: [
        "",
        [Validators.required, Validators.maxLength(128)],
      ],
      companyTradingName: [
        "",
        [Validators.required, Validators.maxLength(128)],
      ],
      companyContact: ["", [Validators.required, Validators.email]],
    });

    this.companyForm.statusChanges.subscribe(() => {
      this.updateFormValidity();
    });

    this.companyService.getCompany(+companyId).subscribe({
      next: (company) => {
        this.myCompany = company;

        this.viewOnly = !(
          (this.sessionService.hasRole("EQUALY_MASTER_ADMIN") ||
            this.sessionService.hasRole("MASTER_ADMIN")) &&
          this.myCompany?.status === "ACTIVE"
        );

        this.companyForm.patchValue({
          companyName: company.name,
          companyDisplayName: company.displayName,
          companyTradingName: company.tradingName,
          companyContact: company.contact,
        });

        if (this.viewOnly) this.companyForm.disable();
        else this.companyForm.enable();

        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao carregar dados da empresa:", err);
        this.loadingService.hide();
        this.router.navigate(["/"]);
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
            res.companies[0].id !== this.myCompany?.id;
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

    this.companyService
      .updateCompany(this.myCompany!.id.toString(), companyRequest)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: () => {
          this.loginService.logout();
          this.router.navigate(["/login"]);
        },
        error: () => {
          this.router.navigate(["/"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao atualizar empresa",
            },
          });
        },
      });
  }

  private markAllFieldsAsTouched() {
    Object.values(this.companyForm.controls).forEach((control) =>
      control.markAsTouched()
    );
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

  confirmSave() {
    if (this.cantSubmit || this.companyForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.editCompany();
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }
}
