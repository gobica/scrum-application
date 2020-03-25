import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { postData, respData} from '../objects/postdataObj';
import { User } from '../models/user'

@Injectable()
export class UserService {
  postUrl: string = "http://localhost:3000/api/register";
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': 'my-auth-token'
    })
  };
  constructor(private httpClient : HttpClient) { }

  register (user: User) {
    return this.httpClient.post(this.postUrl, user, this.httpOptions);
    //return this.httpClient.post<postData>(this.postUrl, postD, this.httpOptions);
    /*return this.httpClient.post<postData>(this.postUrl, postD, this.httpOptions)
      .pipe(
        catchError(err => {
          return of(null);
        })
      );
      */
  }


}
