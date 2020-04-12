import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { DashboardComponent} from './components/dashboard/dashboard.component';
import { AuthGuard } from './helpers/auth.guard';
import { ShowProjectComponent } from './components/showProject/showProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'addProject', component: AddProjectComponent },
  { path: 'showProject', component: ShowProjectComponent }, // For editing project
  { path: 'editProject/:id', component: EditProjectComponent },
  { path: '**', redirectTo: '' }

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
