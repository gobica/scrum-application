import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { DashboardComponent} from './components/dashboard/dashboard.component';
import { AuthGuard } from './helpers/auth.guard';
import { ShowProjectComponent } from './components/showProject/showProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';
import { SprintBacklogComponent } from './components/sprint-backlog/sprint-backlog.component';
import { EditUsersComponent } from './components/edit-users/edit-users.component';
import { ProjectDashboardComponent } from './components/project-dashboard/project-dashboard.component';
import { AddTaskComponent } from "./components/add-task/add-task.component";
import { ShowTaskComponent } from "./components/show-task/show-task.component";
import { ResetByMailComponent } from "./components/reset-password/reset-by-mail.component"
import { NewPasswordComponent } from "./components/reset-password/new-password.component"

SprintBacklogComponent

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'addProject', component: AddProjectComponent },
  { path: 'showProject', component: ShowProjectComponent }, // For editing project
  { path: 'editProject/:id', component: EditProjectComponent },
  { path: 'editUsers', component: EditUsersComponent },
  { path: 'projectDashboard/:id', component: ProjectDashboardComponent },
  { path: 'projectDashboard/:projectId/sprint/:sprintId/story/:storyId/addTask', component: AddTaskComponent },
  { path: 'projectDashboard/:projectId/sprint/:sprintId/story/:storyId/showTask', component: ShowTaskComponent },     // /project/:projectId/sprint/:sprintId/story/:storyId/task
  { path: 'reset', component: ResetByMailComponent },
  { path: 'reset/:token', component: NewPasswordComponent },




  { path: '**', redirectTo: '' }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
