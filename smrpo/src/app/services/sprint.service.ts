import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Sprint } from '../models/sprint'
import { Story } from '../models/story'

import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SprintService {
  projectUrl: string = "";
  getSprintsUrl: string = "";
  constructor(private httpClient : HttpClient) {
    this.projectUrl =  environment.apiUrl + '/project';
    this.getSprintsUrl = environment.apiUrl + '/sprint' ;
   }


   // TLE ČE BO KDO KLICU APIJE NISO PREVERJEN 
  addSprint (sprint: Sprint, idProject: number) {
    console.log("sprint", sprint);
    return this.httpClient.post(this.projectUrl + `/${idProject}` + '/sprint', sprint);
  }


  updateSprint (idProject: number, idSprint: number,  sprint: Sprint)  {
    return this.httpClient.put<Sprint>(this.projectUrl + `/${idProject}` + '/sprint' + `/${idSprint}`, sprint);

  }
  delete(id: number) {
    return this.httpClient.delete(this.getSprintsUrl + `/${id}`);
  }
  getSprint(idProject: number, idSprint: number) {
    return this.httpClient.get<Sprint>(this.projectUrl + `/${idProject}` + '/sprint' + `/${idSprint}`);
  }
  getAll(idProject: number) {
    return this.httpClient.get<Sprint[]>(this.projectUrl + `/${idProject}` + '/sprint');
  }
  addStorytoSprint ( idProject: number, idSprint: number, idOfStory: number) {
    var idOfStories  = []
    idOfStories.push(idOfStory)

    var object = {
      "stories": idOfStories
    }
     return this.httpClient.put(this.projectUrl + `/${idProject}` + '/sprint'+ `/${idSprint}` + '/story', object );
  }
 

   //project/<idProject>/sprint


}
