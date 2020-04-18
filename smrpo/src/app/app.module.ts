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
    DialogCompletedTaskComponent
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
    UserService
  ],
  bootstrap: [AppComponent],
  entryComponents: [AddSprintDialogComponent],



})
export class AppModule { }
