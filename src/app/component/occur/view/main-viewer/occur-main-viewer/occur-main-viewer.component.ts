import { Component, Input } from '@angular/core';
import { Occur } from '../../../../../core/model/occur/occur.model';
import { DatePipe } from '@angular/common';
import { OccurStatusPipe } from '../../../../../pipe/occur-status-pipe.pipe';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-occur-main-viewer',
  imports: [DatePipe, OccurStatusPipe, NgbPopover],
  templateUrl: './occur-main-viewer.component.html',
  styleUrl: './occur-main-viewer.component.scss',
  standalone: true
})
export class OccurMainViewerComponent {

  @Input() occur: Occur | null = null;

}