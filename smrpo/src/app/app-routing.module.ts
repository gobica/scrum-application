import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
//import { LoginComponent } from './components/login/login.component';
import { AddProjectComponent } from './components/addProject/addProject.component';
import { SearchProjectComponent } from './components/editProject/editProject.component';
import { EditProjectComponent } from './components/editProject/editProject.component';


const routes: Routes = [

  { path: '', component: HomeComponent },

  { path: 'register', component: RegisterComponent },
 // { path: 'login', component: LoginComponent }

  { path: 'addProject', component: AddProjectComponent },
  { path: 'searchProject', component: SearchProjectComponent }, //For editing project
  { path: 'editProject', component: EditProjectComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
