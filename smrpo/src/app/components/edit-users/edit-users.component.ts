import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user'
import { UserService } from '../../services/user.service';
import { AuthenticationService } from  '../../services/authentication.service';
import { first } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
import {EditUserDialogComponent} from '../edit-user-dialog/edit-user-dialog.component'
import { AlertService,  } from '../../services/alert.service';
import {MatDialog, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';


import { LogoutDialogComponent } from './logout-dialog/logout-dialog.component';

@Component({
  selector: 'app-edit-users',
  templateUrl: './edit-users.component.html',
  styleUrls: ['./edit-users.component.css']
})
export class EditUsersComponent implements OnInit {
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
    private alertService: AlertService,
    public dialog: MatDialog

    ) {
      this.currentUserValue = this.authenticationService.currentUserValueFromToken;
      console.log("current user v dashboard", this.currentUserValue);

     }

  ngOnInit(): void {
    if (this.currentUserValue.globalRole == 'admin') this.loadAllUsers();
    this.isDataLoaded = true;


  }

  deleteUser(index: number, id: number) {
      this.userService.delete(id)
          .pipe(first())
          .subscribe(data => {
            this.users[index].isDeleted = !this.users[index].isDeleted;
            this.loadAllUsers()
          });
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
                this.loadAllUsers();

            });
  }

  private loadAllUsers() {
    this.userService.getAll(true)
        .pipe(first())
        .subscribe(users => {
          this.users = users;
          console.log("vsi userji",users);
        });
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



public changeCurrentUser ( user) {
  // get project by id
  this.alertService.clear();
  const dialogRef = this.dialog.open(LogoutDialogComponent, {
    width: '50vw',
    // data: {userConfirmed: this.allTasks[i].userConfirmed}
  });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.updateCurrentUser(user);
              
        }
      });
    
}

updateCurrentUser(user: User) {

  this.loading = true;
  this.userService.updateUser(user)
      .pipe(first())
      .subscribe(
          data => {
              this.alertService.success('Update successful', true);
              this.authenticationService.logout();

          },
          error => {
              this.alertService.error(error);
              this.loading = false;
              this.loadAllUsers();

          });
}

}
