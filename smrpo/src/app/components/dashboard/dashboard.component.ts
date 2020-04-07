import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {EditUserDialogComponent} from '../edit-user-dialog/edit-user-dialog.component'
import { AlertService,  } from '../../services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  editField: string;
  currentUserValue: User;
  users = [];
  user;
  isDataLoaded ;


  constructor( 
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private matDialog: MatDialog,
    private alertService: AlertService
    ) {
      this.currentUserValue = this.authenticationService.currentUserValueFromToken;
      console.log("current user v dashboard", this.currentUserValue);

     }

  ngOnInit(): void {
    if (this.currentUserValue.globalRole == 'admin') this.loadAllUsers();
    this.isDataLoaded = true; 
  

  }

  deleteUser(id: number) {
    this.userService.delete(id)
        .pipe(first())
        .subscribe(() => this.loadAllUsers());
}
checkIfSame (user: User ) {
  if (this.currentUserValue.id == user.id) {
    return true; 
  }  
  return false; 
}
updateUser(user: User) {
  
  this.loading = true;
  this.userService.updateUser(user)
      .pipe(first())
      .subscribe(
          data => {
              this.alertService.success('Update successful', true);
          },
          error => {
              this.alertService.error(error);
              this.loading = false;
          });
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

updateList(i: number, property: string, event: any) {
  const editField = event.target.textContent;
  this.users[i][property] = editField;
}

remove(i: any) {
  //this.awaitingPersonList.push(this.users[id]);
  this.users.splice(i, 1);

}



changeValue(i: number,userId:number, property: string, event: any) {
  this.editField = event.target.textContent;

}


}
