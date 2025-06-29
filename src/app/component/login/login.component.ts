import { Component } from "@angular/core";
import { LoadingService } from "../../core/service/loading.service";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { LoginRequest } from "../../core/model/login-request.model";
import { LoginService } from "../../core/service/login.service";
import { SessionService } from "../../core/service/session.service";
import { SendRecovery } from "../../core/model/send-recovery.model";
import { RecoveryService } from "../../core/service/recovery.service";
import { LoginCompanySearchRequest } from "../../core/model/login-company-search-request.model";
import { Company } from "../../core/model/login-company.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  standalone: true,
})
export class LoginComponent {
  flowType: string = "COMMON_LOGIN";
  subflowType: string = "";

  invalidLogin: boolean = false;
  invalidRecovery: boolean = false;
  recoveryCodeSent: boolean = false;
  companiesSearched: boolean = false;

  companies: Company[] = [];
  page = 0;
  totalPages = 0;
  pages: number[] = [];

  loginForm!: FormGroup;
  recoveryForm!: FormGroup;
  companySearchForm!: FormGroup;
  companyLoginForm!: FormGroup;

  selectedCompany: Company | null = null;
  selectedUserDocument: string | null = null;

  constructor(
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private sessionService: SessionService,
    private recoveryService: RecoveryService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      login: ["", [Validators.minLength(4), Validators.maxLength(32)]],
      password: ["", [Validators.minLength(8), Validators.maxLength(16)]],
    });

    this.recoveryForm = this.formBuilder.group({
      login: ["", [Validators.minLength(4), Validators.maxLength(32)]],
      companyAlias: ["", [Validators.minLength(4), Validators.maxLength(32)]],
    });

    this.companySearchForm = this.formBuilder.group({
      customerDocument: [
        "",
        [Validators.minLength(8), Validators.maxLength(11)],
      ],
    });

    this.companyLoginForm = this.formBuilder.group({
      password: ["", [Validators.minLength(8), Validators.maxLength(16)]],
    });
  }

  changeView(viewName: string, event: Event) {
    event.preventDefault();

    if (viewName === "RECOVERY") {
      this.flowType = "RECOVERY";
      this.subflowType = "";
    } else if (viewName === "COMMON_LOGIN") {
      this.flowType = "COMMON_LOGIN";
      this.subflowType = "";
    } else if (viewName === "COMPANY_SEARCH") {
      this.flowType = "COMPANY_LOGIN";
      this.subflowType = "COMPANY_SEARCH";
    } else if (viewName === "COMPANY_LIST") {
      this.flowType = "COMPANY_LOGIN";
      this.subflowType = "COMPANY_LIST";
    } else if (viewName === "COMPANY_CREDENTIALS") {
      this.flowType = "COMPANY_LOGIN";
      this.subflowType = "COMPANY_CREDENTIALS";
    }
  }

  submitLogin(loginType: string) {
    this.loadingService.show();
    let credentials: LoginRequest;

    if (loginType === "COMPANY_LOGIN") {
      credentials = this.companyLoginForm.value as LoginRequest;
      credentials.companyId = this.selectedCompany!.id;
      credentials.document = this.selectedUserDocument!;

      if (this.companyLoginForm.invalid) {
        this.invalidLogin = true;
      } else {
        this.invalidLogin = false;
      }
    } else {
      credentials = this.loginForm.value as LoginRequest;

      if (this.loginForm.invalid) {
        this.invalidLogin = true;
      } else {
        this.invalidLogin = false;
      }
    }

    this.loginService.login(credentials, loginType).subscribe({
      next: (res) => {
        this.sessionService.saveSessionData(
          res.token_type,
          res.access_token,
          res.refresh_token,
          res.expires_in
        );
        this.loadingService.hide();
        this.router.navigate(["/home"]);
      },
      error: (err) => {
        console.error("Erro ao chamar API de Autenticação: ", err);
        this.invalidLogin = true;
        this.loadingService.hide();
      },
    });
  }

  sendRAC() {
    const recoveryData: SendRecovery = this.recoveryForm.value as SendRecovery;

    this.loadingService.show();
    this.recoveryService.sendRAC(recoveryData).subscribe({
      next: (res) => {
        this.recoveryCodeSent = true;
        console.info("Código RAC Enviado! ");
        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao chamar API de Recuperação: ", err);
        this.invalidRecovery = true;
        this.loadingService.hide();
      },
    });

    if (this.recoveryForm.invalid) {
      this.invalidRecovery = true;
    } else {
      this.invalidRecovery = false;
    }
  }

  loadPage(page: number) {
    this.page = page;
    this.searchCompanies();
  }

  searchCompanies() {
    const companySearchData: LoginCompanySearchRequest = this.companySearchForm
      .value as LoginCompanySearchRequest;

    this.loadingService.show();
    this.loginService.searchCompanies(companySearchData, this.page).subscribe({
      next: (res) => {
        this.companies = res.companies;
        this.page = res.pageable.number;
        this.totalPages = res.pageable.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.companiesSearched = true;
        this.flowType = "COMPANY_LOGIN";
        this.subflowType = "COMPANY_LIST";
        this.selectedUserDocument = companySearchData.customerDocument;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao chamar API de Consulta de Empresas: ", err);
        this.loadingService.hide();
      },
    });
  }

  selectCompany(company: Company, event: Event) {
    this.changeView("COMPANY_CREDENTIALS", event);
    this.selectedCompany = company;
  }
}
