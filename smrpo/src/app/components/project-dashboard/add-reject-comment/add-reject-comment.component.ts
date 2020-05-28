
import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  reviewComment: string;

}

@Component({
  selector: 'app-add-reject-comment',
  templateUrl: './add-reject-comment.component.html',
  styleUrls: ['./add-reject-comment.component.css']
})
export class AddRejectCommentComponent {

  constructor(
    public dialogRef: MatDialogRef<AddRejectCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}





