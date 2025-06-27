import { Component } from "@angular/core";
import { LoadingService } from "../../core/service/loading.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-loading-layout",
  templateUrl: "./loading-layout.component.html",
  styleUrls: ["./loading-layout.component.scss"],
  standalone: true,
  imports: [CommonModule]
})
export class LoadingLayoutComponent {
  constructor(public loadingService: LoadingService) {}
}
