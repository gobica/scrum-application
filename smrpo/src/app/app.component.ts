import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  currentUser: User;
  currentUserValue: User;
  dataLoaded = false; 

  constructor(
      private router: Router,
      public authenticationService: AuthenticationService,  
  ) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
      //this.currentUser  = this.authenticationService.currentUserValue;
      //console.log ("CURRENTUSER", this.currentUser);
      this.dataLoaded = true; 

      if (this.currentUser) {
       //  this.ifAdmin = this.authenticationService.isAdmin(); 
       this.currentUserValue = authenticationService.currentUserValueFromToken;
       this.dataLoaded = true; 
       console.log("loggedin" );

      }
  }

  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
      console.log("loggedout")

  }
}

