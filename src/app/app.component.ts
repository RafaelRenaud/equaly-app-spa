import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingLayoutComponent } from './layout/loading-layout/loading-layout.component';

@Component({
  selector: "app-root",
  imports: [RouterOutlet, LoadingLayoutComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "equaly-app-spa";
}
