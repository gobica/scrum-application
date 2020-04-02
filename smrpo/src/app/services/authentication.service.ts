import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as jwt_decode from 'jwt-decode';

import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    postUrl: string = "";
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.postUrl =  environment.apiUrl + '/login';
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    public get currentUserValueFromToken() : User {
    
        let tempUser = this.currentUserValue;
        return this.getDecodedAccessToken(tempUser.token); // decode token
  
    }
    
    login(email: string, password: string) {
        return this.http.post<any>(this.postUrl, { email, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }


    isAdmin () {
        let tempUser = this.currentUserValueFromToken;
        console.log(tempUser.globalRole);
        if (tempUser.globalRole == "admin") {
          console.log("true");
          return true;
        }
        else {
          console.log("tle bi mogl bit false");
          return false;
      }
      }
    getDecodedAccessToken(token: string): any {
        try{
            return jwt_decode(token);
        }
        catch(Error){
            return null;
        }
      }
    
}
