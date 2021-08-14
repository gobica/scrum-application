import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Work } from '../models/work'
import { environment } from 'src/environments/environment';
import {first} from "rxjs/operators";
import {Project} from "../models/project";

@Injectable({  providedIn: 'root' })
export class WorkService {

  urlProject: string = "";
  urlSprintById: string = "";
  urlStoryById: string = "";
  urlTask: string = "";
  urlLog: string = "";

  constructor(private httpClient : HttpClient) {

    // /project/:projectId/sprint/:sprintId/story/:storyId/task/:taskId/log

    this.urlProject =  environment.apiUrl + '/project';
    this.urlSprintById = '/sprint';
    this.urlStoryById = '/story';
    this.urlTask = '/task';
    this.urlLog = '/log';

   }

  getAllWorkOfTask(idProject: number, idSprint: number, idStory: number, idTask: number) {
    return this.httpClient.get<Work[]>(this.urlProject + `/${idProject}` + this.urlSprintById + `/${idSprint}` + this.urlStoryById + `/${idStory}` + this.urlTask + `/${idTask}` + this.urlLog);
  }

  addWorkToTask(idProject: number, idSprint: number, idStory: number, idTask: number, work: Work) {
    return this.httpClient.post(this.urlProject + `/${idProject}` + this.urlSprintById + `/${idSprint}` + this.urlStoryById + `/${idStory}` + this.urlTask + `/${idTask}` + this.urlLog, work);
  }


}
