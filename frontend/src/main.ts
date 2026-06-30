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

    provideIonicAngular({ animated: false }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiNoCacheInterceptor])),
  ],
}).catch((err) => console.error(err));

defineCustomElements(window);
