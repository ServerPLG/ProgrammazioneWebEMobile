import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { apiNoCacheInterceptor } from './app/interceptors/api-no-cache.interceptor';
import { authInterceptor } from './app/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // animated:false: con sfondi trasparenti la transizione tra pagine lasciava
    // visibili gli elementi della schermata precedente finche' non finiva
    // l'animazione. Disattivandola il cambio schermata e' immediato e pulito.
    provideIonicAngular({ animated: false }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiNoCacheInterceptor])),
  ],
}).catch((err) => console.error(err));

// Registra i PWA Elements: abilitano la UI della fotocamera Capacitor nel browser
// (per il test in locale). Su device nativo viene usata direttamente la camera.
defineCustomElements(window);
