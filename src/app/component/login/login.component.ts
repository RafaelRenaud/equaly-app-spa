import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { Router } from "@angular/router";

import { LoadingService } from "../../core/service/loading/loading.service";
import { LoginService } from "../../core/service/login/login.service";
import { SessionService } from "../../core/service/session/session.service";
import { RecoveryService } from "../../core/service/recovery/recovery.service";

import { LoginRequest } from "../../core/model/login/login-request.model";
import { LoginCompanySearchRequest } from "../../core/model/login/login-company-search-request.model";
import { SendRecovery } from "../../core/model/recovery/send-recovery.model";
import { Company } from "../../core/model/login/login-company.model";

@Component({
  selector: "app-login",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
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

  loginForm: FormGroup;
  recoveryForm: FormGroup;
  companySearchForm: FormGroup;
  companyLoginForm: FormGroup;

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
      login: [
        "",
        [
          Validators.minLength(4),
          Validators.maxLength(32),
          Validators.required,
        ],
      ],
      password: [
        "",
        [
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.required,
        ],
      ],
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

  // ==============================
  // Getters para simplificar template
  // ==============================
  get isCommonLogin() {
    return this.flowType === "COMMON_LOGIN";
  }
  get isCompanyLogin() {
    return this.flowType === "COMPANY_LOGIN";
  }
  get isRecovery() {
    return this.flowType === "RECOVERY";
  }

  get isCompanySearch() {
    return this.subflowType === "COMPANY_SEARCH";
  }
  get isCompanyList() {
    return this.subflowType === "COMPANY_LIST";
  }
  get isCompanyCredentials() {
    return this.subflowType === "COMPANY_CREDENTIALS";
  }

  // ==============================
  // Controle de views
  // ==============================
  changeView(viewName: string, event: Event) {
    event.preventDefault();
    this.invalidLogin = false;
    this.invalidRecovery = false;

    switch (viewName) {
      case "RECOVERY":
        this.flowType = "RECOVERY";
        this.subflowType = "";
        break;
      case "COMMON_LOGIN":
        this.flowType = "COMMON_LOGIN";
        this.subflowType = "";
        break;
      case "COMPANY_SEARCH":
        this.flowType = "COMPANY_LOGIN";
        this.subflowType = "COMPANY_SEARCH";
        break;
      case "COMPANY_LIST":
        this.flowType = "COMPANY_LOGIN";
        this.subflowType = "COMPANY_LIST";
        break;
      case "COMPANY_CREDENTIALS":
        this.flowType = "COMPANY_LOGIN";
        this.subflowType = "COMPANY_CREDENTIALS";
        break;
    }
  }

  // ==============================
  // Login
  // ==============================
  submitLogin(loginType: string) {
    this.loadingService.show();

    let credentials: LoginRequest;

    if (loginType === "COMPANY_LOGIN") {
      if (!this.selectedCompany || !this.selectedUserDocument) {
        this.invalidLogin = true;
        this.loadingService.hide();
        return;
      }

      credentials = this.companyLoginForm.value as LoginRequest;
      credentials.companyId = this.selectedCompany.id;
      credentials.document = this.selectedUserDocument;

      this.invalidLogin = this.companyLoginForm.invalid;
    } else {
      credentials = this.loginForm.value as LoginRequest;
      this.invalidLogin = this.loginForm.invalid;
    }

    if (this.invalidLogin) {
      this.loadingService.hide();
      return;
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
        this.router.navigate(["/"]);
      },
      error: (err) => {
        console.error("Erro ao chamar API de Autenticação: ", err);
        this.invalidLogin = true;
        this.loadingService.hide();
      },
    });
  }

  // ==============================
  // Recuperação de conta
  // ==============================
  sendRAC() {
    this.invalidRecovery = this.recoveryForm.invalid;
    if (this.invalidRecovery) return;

    const recoveryData: SendRecovery = this.recoveryForm.value as SendRecovery;
    this.loadingService.show();

    this.recoveryService.sendRAC(recoveryData).subscribe({
      next: () => {
        this.recoveryCodeSent = true;
        this.loadingService.hide();
      },
      error: (err) => {
        console.error("Erro ao enviar RAC: ", err);
        this.invalidRecovery = true;
        this.loadingService.hide();
      },
    });
  }

  // ==============================
  // Busca de empresas
  // ==============================
  searchCompanies() {
    const companySearchData: LoginCompanySearchRequest = this.companySearchForm
      .value as LoginCompanySearchRequest;
    this.loadingService.show();

    this.loginService.searchCompanies(companySearchData.customerDocument, null, null,null, this.page, 10).subscribe({
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
        console.error("Erro ao buscar empresas: ", err);
        this.loadingService.hide();
      },
    });
  }

  loadPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    this.searchCompanies();
  }

  selectCompany(company: Company, event: Event) {
    event.preventDefault();
    this.selectedCompany = company;
    this.flowType = "COMPANY_LOGIN";
    this.subflowType = "COMPANY_CREDENTIALS";
  }
}
