import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './components/register/register.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { ShowProjectComponent } from './components/showProject/showProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
/* HTTP CLIENT material */
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { DataService} from './services/user.service';
import { UserService} from './services/user.service';

/* Angular material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './models/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent} from './components/alert/alert.component';
import { LoginComponent } from './components/login/login.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { environment } from 'src/environments/environment';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ErrorInterceptor } from './helpers/error.interceptors';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EditUserDialogComponent } from './components/edit-user-dialog/edit-user-dialog.component';
import { EditUsersComponent } from './components/edit-users/edit-users.component';
import { SprintBacklogComponent } from './components/sprint-backlog/sprint-backlog.component';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { AddSprintDialogComponent } from './components/add-sprint-dialog/add-sprint-dialog.component';
import { AddTaskComponent } from './components/add-task/add-task.component'
import { ShowTaskComponent } from "./components/show-task/show-task.component";
import { DialogCompletedTaskComponent } from "./components/show-task/dialog-completed-task.component";
import { DialogUncompletedTaskComponent } from "./components/show-task/dialog-uncompleted-task.component";
import { DialogAcceptTaskComponent } from "./components/show-task/dialog-accept-task.component";
import { DialogGiveupTaskComponent } from "./components/show-task/dialog-giveup-task.component";
import { DialogRedirectTaskComponent } from "./components/show-task/dialog-redirect-task.component";
import { DialogTimeComponent } from "./components/show-task/dialog-time.component";
import { ResetByMailComponent } from "./components/reset-password/reset-by-mail.component";
import { NewPasswordComponent } from "./components/reset-password/new-password.component";
import { AddUserStoryComponent } from './components/add-user-story/add-user-story.component'

import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!
import {DatePipe} from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    AddProjectComponent,
    ShowProjectComponent,
    EditProjectComponent,
    // RegisterComponent,
    AlertComponent,
    LoginComponent,
    AlertComponent,
    DashboardComponent,
    EditUserDialogComponent,
    EditUsersComponent,
    SprintBacklogComponent,
    ProjectDashboardComponent,
    AddSprintDialogComponent,
    AddTaskComponent,
    ShowTaskComponent,
    DialogCompletedTaskComponent,
    DialogUncompletedTaskComponent,
    DialogAcceptTaskComponent,
    DialogGiveupTaskComponent,
    DialogRedirectTaskComponent,
    DialogTimeComponent,
    ResetByMailComponent,
    NewPasswordComponent,
    AddUserStoryComponent
   // LoginComponent,
   //  AlertComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    AppRoutingModule,
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    HttpClientModule,

    FullCalendarModule, // for FullCalendar!

    JwtModule.forRoot({
      config: {
        tokenGetter: function  tokenGetter() {
             return     localStorage.getItem('access_token');},
        whitelistedDomains: [environment.apiUrl],
        blacklistedRoutes: [environment.apiUrl + '/login']
      }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    
    UserService,
    DatePipe
  ],
  bootstrap: [AppComponent],
  entryComponents: [AddSprintDialogComponent],



})
export class AppModule { }
