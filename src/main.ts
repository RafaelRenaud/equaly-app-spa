/// <reference types="@angular/localize" />

import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import { environment } from "./environments/environment.prod";

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    const splash = document.getElementById("custom-splash-screen");

    if (splash) {
      setTimeout(() => {
        splash.classList.add("hidden");
        setTimeout(() => splash.remove(), 300);
      }, 1000);
    }
  })
  .catch((err) => console.error(err));
