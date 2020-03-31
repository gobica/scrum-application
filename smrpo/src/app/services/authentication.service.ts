import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
    
    login(email, password) {
        return this.http.post<any>(this.postUrl, { email, password })
        //return this.httpClient.post(this.postUrl, user, this.httpOptions);

       // return this.httpClient.post(this.postUrl, postD, this.httpOptions);

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
    
}