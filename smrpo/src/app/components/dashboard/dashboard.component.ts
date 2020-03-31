import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { first } from 'rxjs/operators';
import * as jwt_decode from "jwt-decode";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  users = [];


  constructor( 
    private authenticationService: AuthenticationService,
    private userService: UserService
    ) {
      let tempUser = this.authenticationService.currentUserValue;
       this.currentUser = this.getDecodedAccessToken(tempUser.token); // decode token
      console.log(this.currentUser)


     }

  ngOnInit(): void {
    this.loadAllUsers();
    
  }

  deleteUser(id: number) {
    this.userService.delete(id)
        .pipe(first())
        .subscribe(() => this.loadAllUsers());
}

private loadAllUsers() {
  this.userService.getAll()
      .pipe(first())
      .subscribe(users => this.users = users);

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
