import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { Occur } from "../../../../../core/model/occur/occur.model";
import { SessionService } from "../../../../../core/service/session/session.service";
import { OccurStatusPipe } from "../../../../../pipe/occur-status-pipe.pipe";
import { UserSystemPipe } from "../../../../../pipe/user-system-pipe";

@Component({
  selector: "app-occur-main-viewer",
  imports: [
    DatePipe,
    OccurStatusPipe,
    UserSystemPipe,
  ],
  templateUrl: "./occur-main-viewer.component.html",
  styleUrl: "./occur-main-viewer.component.scss",
  standalone: true,
})
export class OccurMainViewerComponent implements OnInit {
  @Input() occur: Occur | null = null;
  isOccurOpener: boolean = false;
  isInspector: boolean = false;
  isOpener: boolean = false;
  isOccurInspector: boolean = false;

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    this.isOccurOpener =
      Number(this.sessionService.getItem("userId")) === this.occur?.opener?.id;
    this.isInspector = this.sessionService.hasRole("COMMON_QUALITY_INSPECTOR");
    this.isOpener = this.sessionService.hasRole("COMMON_EVENT_OPENER");
    this.isOccurInspector =
      Number(this.sessionService.getItem("userId")) ===
      this.occur?.inspector?.id;
  }
}