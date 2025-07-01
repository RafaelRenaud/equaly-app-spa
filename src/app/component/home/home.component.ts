import { Component } from '@angular/core';
import { SessionService } from '../../core/service/session/session.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-home",
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  userNickname: string | null = null;
  successIndicator: boolean = false;

  constructor(
    private sessionService: SessionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userNickname = this.sessionService.getItem("nickname");

    this.route.queryParamMap.subscribe((params) => {
      const action = params.get("action");

      if (action === "SUCCESS") {
        this.successIndicator = true;
        setTimeout(() => (this.successIndicator = false), 5000);
      }
    });
  }
}