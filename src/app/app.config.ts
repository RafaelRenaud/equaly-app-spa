import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { authInterceptor } from "./core/interceptor/auth.interceptor";
import { routes } from "./app.routes";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { channelInterceptor } from "./core/interceptor/channel.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, channelInterceptor])),
    provideClientHydration(withEventReplay())
  ],
};
