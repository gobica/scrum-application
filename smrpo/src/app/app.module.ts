import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { AddMemberToProjectComponent } from './components/addProject/addProject.component';
import { SearchProjectComponent } from './components/editProject/editProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';
import { HomeComponent } from './components/home/home.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

/* HTTP CLIENT material */
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
//import { DataService} from './services/user.service'
import { UserService} from './services/user.service'

/* Angular material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './models/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent} from './components/alert/alert.component';
//import { LoginComponent } from './components/login/login.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';

import { ErrorInterceptor } from './helpers/error.interceptors';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    AddProjectComponent,
    AddMemberToProjectComponent,
    SearchProjectComponent,
    EditProjectComponent,
    HomeComponent,
    // RegisterComponent,
    AlertComponent,
   // LoginComponent,
   //  AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    UserService
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
