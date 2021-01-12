import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { ToastrModule } from "ngx-toastr";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserComponent } from './user/user.component';
import { UserService } from './shared/user.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoginComponent } from './user/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { ContextService } from './shared/context.service';
import { AuthGuard } from './auth/auth.guard.service';
import { UserListComponent } from './usermanagement/user-list/user-list.component';
import { TripHomeComponent } from './trip-home/trip-home.component';
import { TripDetailComponent } from './trip-home/trip-detail/trip-detail.component';
import { TripListComponent } from './trip-home/trip-list/trip-list.component';
import { TripService } from './shared/trip.service';
import { UserDetailComponent } from './usermanagement/user-detail/user-detail.component';
import { UsermanagementComponent } from './usermanagement/usermanagement.component';
import { MaterialModule } from './material/material.module';

@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    LoginComponent,
    HomeComponent,
    AdminPanelComponent,
    ForbiddenComponent,
    UserListComponent,
    TripHomeComponent,
    TripDetailComponent,
    TripListComponent,
    UserDetailComponent,
    UsermanagementComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ToastrModule.forRoot(
      {
        positionClass: "toast-bottom-right"
      }
    ),
    MaterialModule
  ],
  providers: [
    UserService,
    ContextService,
    AuthGuard,
    TripService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
