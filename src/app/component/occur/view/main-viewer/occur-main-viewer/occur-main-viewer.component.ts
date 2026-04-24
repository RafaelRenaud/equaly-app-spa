import { Component, Input, OnInit } from '@angular/core';
import { Occur } from '../../../../../core/model/occur/occur.model';
import { DatePipe } from '@angular/common';
import { OccurStatusPipe } from '../../../../../pipe/occur-status-pipe.pipe';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { SessionService } from '../../../../../core/service/session/session.service';

@Component({
  selector: 'app-occur-main-viewer',
  imports: [DatePipe, OccurStatusPipe, NgbPopover],
  templateUrl: './occur-main-viewer.component.html',
  styleUrl: './occur-main-viewer.component.scss',
  standalone: true
})
export class OccurMainViewerComponent implements OnInit{

  @Input() occur: Occur | null = null;
  isOccurOpener: boolean = false;
  isOccurInspector: boolean = false;

  constructor(
    private sessionService: SessionService
  ){}

  ngOnInit(): void {
    this.isOccurInspector = Number(this.sessionService.getItem("userId")) === this.occur?.opener?.id;
    this.isOccurInspector = Number(this.sessionService.getItem("userId")) === this.occur?.inspector?.id;
  }

}