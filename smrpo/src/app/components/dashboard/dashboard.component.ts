import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {EditUserDialogComponent} from '../edit-user-dialog/edit-user-dialog.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User;
  users = [];
  ifAdmin; 
  user;

  constructor( 
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private matDialog: MatDialog

    ) {

      this.currentUser = this.authenticationService.currentUserValueFromToken;

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

getUserByID (id: number) {
  this.userService.getUser(id)
    .pipe(first())
    .subscribe(user => this.user = user); 

}

openDialog(userObject: User) {

  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = userObject;
  this.matDialog.open(EditUserDialogComponent, dialogConfig);
  //this.matDialog.open(EditUserDialogComponent, dialogConfig);
}


}
