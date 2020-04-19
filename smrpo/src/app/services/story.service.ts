import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Story } from '../models/story'
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StoryService {
  projectUrl: string = "";
  getStoryUrl: string = "";
  constructor(private httpClient : HttpClient) {
    this.projectUrl =  environment.apiUrl + '/project';
    this.getStoryUrl = environment.apiUrl + '/story' ;
   }
 
  
  addStory(story: Story, idProject: number) {
    return this.httpClient.post(this.projectUrl + `/${idProject}` + '/story', story);
  }
}


  /*
  updateUser (sprint: Sprint) {
    var id = sprint.id;
    console.log ("tok je id;", id)
    return this.httpClient.put(this.getSprintsUrl + `/${id}`, sprint);
  }
  delete(id: number) {
    return this.httpClient.delete(this.getSprintsUrl + `/${id}`);
  }
  getUser(id: number) {
    return this.httpClient.get(this.getSprintsUrl + `/${id}`);
  }
  getAll(idProject: number) {
    return this.httpClient.get<Sprint[]>(this.projectUrl + `/${idProject}` + '/sprint');
  }
  */