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
  getAll(idProject: number) {
    return this.httpClient.get<Story[]>(this.projectUrl + `/${idProject}` + '/story');
  }

  updateStory(idProject: number, idStory: number, story: Story) {
    return this.httpClient.put(this.projectUrl + `/${idProject}`+ '/story' +`/${idStory}`, story);
  }

  deleteStory(idProject: number, idStory: number) {
    return this.httpClient.delete(this.projectUrl + `/${idProject}`+ '/story' +`/${idStory}`);
  }





  updateIsAcceptedOrIsReady(values, idProject: number, idSprint: number, idStory: number) {
    return this.httpClient.put(this.projectUrl + `/${idProject}`+  '/sprint'  + `/${idSprint}`+ '/story' +`/${idStory}`, values);
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
  */

  