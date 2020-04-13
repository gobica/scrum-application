import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Project } from '../models/project'
import { environment } from 'src/environments/environment';
import {first} from "rxjs/operators";
import {User} from "../models/user";

@Injectable({  providedIn: 'root' })
export class ProjectService {

  urlProject: string = "";
  urlUsersById: string = "";

  constructor(private httpClient : HttpClient) {

    this.urlProject =  environment.apiUrl + '/project';
    this.urlUsersById = '/user';
   }


  getAllProjects() {
    return this.httpClient.get<Project[]>(this.urlProject);
  }

  createProject(project: Project) {
    return this.httpClient.post(this.urlProject, project);
  }

  getProject(id: number) {
    return this.httpClient.get(this.urlProject + `/${id}`);
  }

  updateProject(project: Project) {
    var id = project.id;
    return this.httpClient.put(this.urlProject + `/${id}`, project);
  }
  addUserToProject(idProject: number, idUser: number) {
    return this.httpClient.post(this.urlProject + `/${idProject}` + this.urlUsersById + `/${idUser}`, {});
  }

  deleteUserFromProject(idProject: number, idUser: number) {
    return this.httpClient.delete(this.urlProject + `/${idProject}` + this.urlUsersById + `/${idUser}`);
  }
}
