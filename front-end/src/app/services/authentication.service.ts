import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as jwt_decode from 'jwt-decode';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    postUrl: string = "";
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private globalRole;

    constructor(private http: HttpClient, 
        private router: Router,
        ) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.postUrl =  environment.apiUrl + '/login';
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    public get currentUserValueFromToken() : User {
      
        let tempUser = this.currentUserSubject.value;
        return this.getDecodedAccessToken(tempUser.token); // decode token
  
    }
    
    login(username: string, password: string) {
        return this.http.post<any>(this.postUrl, { username, password })
            .pipe(map(user => {
                console.log("login strgyin user", JSON.stringify(user));

                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                // console.log(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);


    }

/*
    isAdmin () {
        if (this.globalRole == "admin") {
          console.log("true");
          return true;
        }
        else {
          return false;
      }
      
      }
      */
    getDecodedAccessToken(token: string): any {
        try{
            return jwt_decode(token);
        }
        catch(Error){
            return null;
        }
      }

    getTokenExpirationDate(exp: number): Date {
    console.log(exp);

    if (exp === undefined) return null;

    const date = new Date(0); 
    date.setUTCSeconds(exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    if(!this.currentUser) return true;
    console.log(this.currentUserValue.exp);
    const date = this.getTokenExpirationDate(this.currentUserValueFromToken.exp);
    if(date === undefined) return false;
    //return !(date.valueOf() > new Date().valueOf());
    if (date.valueOf() > new Date().valueOf()) return false; 
    else {
      this.logout();
      return true;} 
  }
    
}
