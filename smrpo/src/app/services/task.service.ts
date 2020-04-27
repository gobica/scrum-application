import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Task } from '../models/task'
import { environment } from 'src/environments/environment';
import {first} from "rxjs/operators";
import {Project} from "../models/project";

@Injectable({  providedIn: 'root' })
export class TaskService {

  urlProject: string = "";
  urlSprintById: string = "";
  urlStoryById: string = "";
  urlTask: string = "";

  constructor(private httpClient : HttpClient) {

    // /project/:projectId/sprint/:sprintId/story/:storyId/task

    this.urlProject =  environment.apiUrl + '/project';
    this.urlSprintById = '/sprint';
    this.urlStoryById = '/story';
    this.urlTask = '/task';

   }


  getAllTasksOfStory(idProject: number, idSprint: number, idStory: number) {
    return this.httpClient.get<Task[]>(this.urlProject + `/${idProject}` + this.urlSprintById + `/${idSprint}` + this.urlStoryById + `/${idStory}` + this.urlTask);
  }

  addTasksToStory(idProject: number, idSprint: number, idStory: number, task: Task) {
    return this.httpClient.post(this.urlProject + `/${idProject}` + this.urlSprintById + `/${idSprint}` + this.urlStoryById + `/${idStory}` + this.urlTask, task);
  }
}
