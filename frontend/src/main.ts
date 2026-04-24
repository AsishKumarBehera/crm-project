import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/services/auth.interceptor';

import { appConfig } from './app/app.config';
import { App } from './app/app';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),

    // ✅ CORRECT WAY
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    importProvidersFrom(NgxDaterangepickerMd.forRoot()),
  ]
}).catch((err) => console.error(err));