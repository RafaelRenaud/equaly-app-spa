import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-recovery",
  imports: [],
  templateUrl: "./recovery.component.html",
  styleUrl: "./recovery.component.scss",
  standalone: true,
})
export class RecoveryComponent {
  private recoveryToken: string | null = null;
  recoveryEmail: string | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.recoveryToken = params.get("token");
      this.recoveryEmail = params.get("email");
    });
  }

  constructor(private route: ActivatedRoute) {}
}
