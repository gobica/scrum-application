import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                //this.authenticationService.logout();
                location.reload(true);
            }
             if (err.status === 200) {
                // auto logout if 200 response returned from api
                // location.reload(true); // ne brisat --> rabi za shranjevati editane projekte
            }
            console.log("ERRROR", err.error.messages);
            // console.log(err.status);
            if (err.error.messages) {
                err.error.message = err.error.messages[0];
            }
            const error =   err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}
