import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { DashboardComponent} from './components/dashboard/dashboard.component';
import { AuthGuard } from './helpers/auth.guard';
import { SearchProjectComponent } from './components/editProject/editProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';
import { SprintBacklogComponent } from './components/sprint-backlog/sprint-backlog.component';

SprintBacklogComponent

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'addProject', component: AddProjectComponent },
  { path: 'searchProject', component: SearchProjectComponent }, // For editing project
  { path: 'editProject', component: EditProjectComponent },
  { path: 'springBacklog', component: SprintBacklogComponent },

  { path: '**', redirectTo: '' }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
