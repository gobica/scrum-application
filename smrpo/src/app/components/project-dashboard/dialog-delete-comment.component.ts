import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {

}

@Component({
  selector: 'dialog-delete-comment',
  templateUrl: 'dialog-delete-comment.component.html',
})
export class DialogDeleteCommentComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogDeleteCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
