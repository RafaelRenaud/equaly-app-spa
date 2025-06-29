import { Component } from '@angular/core';
import { SessionService } from '../../core/service/session.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  userNickname: string | null = null;

  constructor(private sessionService: SessionService){}

  ngOnInit(): void{
    this.userNickname = this.sessionService.getItem("nickname");
  }

}
