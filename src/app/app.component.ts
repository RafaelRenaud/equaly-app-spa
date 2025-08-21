import { Component } from "@angular/core";
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from "@angular/router";
import { LoadingLayoutComponent } from "./layout/loading-layout/loading-layout.component";
import { AlertService, AlertType } from "./core/service/alert/alert.service";
import { filter } from "rxjs";
import { AlertLayoutComponent } from "./layout/alert/alert.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, LoadingLayoutComponent, AlertLayoutComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "equaly-app-spa";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const queryParams = this.route.snapshot.queryParamMap;
        const type = queryParams.get("action") as AlertType | null;
        const message = queryParams.get("message") || undefined;

        if (type === "SUCCESS" || type === "ERROR" || type === "WARNING") {
          this.alertService.show(type, message);
          this.router.navigate([], {
            queryParams: { action: null, message: null },
            queryParamsHandling: "merge",
          });
        }
      });
  }
}
