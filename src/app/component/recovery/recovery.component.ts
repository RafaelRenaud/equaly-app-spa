import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Recovery } from "../../core/model/recovery/recovery.model";
import { LoadingService } from "../../core/service/loading/loading.service";
import { RecoveryData } from "../../core/model/recovery/recovery-data.model";
import { RecoveryService } from "../../core/service/recovery/recovery.service";

@Component({
  selector: "app-recovery",
  imports: [ReactiveFormsModule],
  templateUrl: "./recovery.component.html",
  styleUrl: "./recovery.component.scss",
  standalone: true,
})
export class RecoveryComponent {
  private recoveryToken: string | null = null;
  recoveryEmail: string | null = null;
  invalidRecovery: boolean = false;

  recoveryForm!: FormGroup;
  recoveredAccount: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private recoveryService: RecoveryService,
    private loadingService: LoadingService
  ) {
    this.recoveryForm = this.formBuilder.group({
      racCode: ["", [Validators.required]],
      password1: ["", [Validators.minLength(8), Validators.maxLength(16)]],
      password2: ["", [Validators.minLength(8), Validators.maxLength(16)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.recoveryToken = params.get("token");
      this.recoveryEmail = params.get("email");

      if (this.recoveryToken === null || this.recoveryEmail === null) {
        this.router.navigate(["/"]);
      }
    });
  }

  accountRecovery() {
    let recoveryDto: Recovery = this.recoveryForm.value as Recovery;

    this.loadingService.show();

    if (recoveryDto.password1 === recoveryDto.password2 && recoveryDto.password1 != "") {
      const recoveryData: RecoveryData = {
        rac: recoveryDto.racCode,
        email: this.recoveryEmail!,
        newPassword: recoveryDto.password1,
      };

      this.recoveryService
        .accountRecovery(this.recoveryToken!, recoveryData)
        .subscribe({
          next: (res) => {
            this.loadingService.hide();
            this.recoveredAccount = true;
            this.router.navigate(["/login"]);
          },
          error: (err) => {
            console.error("Erro ao chamar API de Recuperação: ", err);
            this.invalidRecovery = true;
            this.loadingService.hide();
          },
        });
    } else {
      this.invalidRecovery = true;
      this.loadingService.hide();
    }
  }
}
