import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app/app.routes';
import { AuthGuard } from './app/auth.guard';
import { AuthService } from './app/auth.service';
import { FormsModule } from '@angular/forms';
import { GeocodingService } from './app/geocoding.service';
import { ObjectiveService } from './app/objective.service';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      RouterModule.forRoot(routes),
      FormsModule
    ),
    AuthGuard,
    AuthService,
    GeocodingService,
    ObjectiveService,
  ],
});
