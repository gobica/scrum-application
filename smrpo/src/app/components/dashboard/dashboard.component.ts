import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  users = [];
  ifAdmin; 

  constructor( 
    private authenticationService: AuthenticationService,
    private userService: UserService,

    ) {

      this.currentUser = this.authenticationService.currentUserValueFromToken;
      console.log("to je user", this.currentUser)

     }

  ngOnInit(): void {
    this.ifAdmin = this.authenticationService.isAdmin(); 
    if (this.ifAdmin) this.loadAllUsers();
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


}
