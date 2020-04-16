import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user'
import { environment } from 'src/environments/environment';

@Injectable()
export class UserService {
  postUrl: string = "";
  getUsersUrl: string = "";

  /*
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'my-auth-token'
    })
  };
  */
  constructor(private httpClient : HttpClient) {
    this.postUrl =  environment.apiUrl + '/register';
    this.getUsersUrl = environment.apiUrl + '/user' ;
   }

  register (user: User) {
    return this.httpClient.post(this.postUrl, user, //this.httpOptions
      );

  }

  updateUser (user: User) {
    var id = user.id;
    console.log ("tok je id;", id)
    return this.httpClient.put(this.getUsersUrl + `/${id}`, user);
  }
  delete(id: number) {
    return this.httpClient.delete(this.getUsersUrl + `/${id}`);
  }
  getUser(id: number) {
    return this.httpClient.get(this.getUsersUrl + `/${id}`);
  }
  getAll(includeDeleted: boolean = false) {
    return this.httpClient.get<User[]>(this.getUsersUrl + '?includeDeleted=' + includeDeleted);
  }


}
