import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { User } from './models/user';

//import './_content/app.less';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  currentUser: User;
  ifAdmin = true;

  constructor(
      private router: Router,
      private authenticationService: AuthenticationService,
      
      
  ) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
      if (this.authenticationService.currentUserValue) {
        this.ifAdmin = this.authenticationService.isAdmin(); 
      }
  }

  logout() {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
  }
  

  
  
}