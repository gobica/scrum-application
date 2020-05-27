



import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {

}

@Component({
  selector: 'app-dialog-delete-story',
  templateUrl: './dialog-delete-story.component.html',
  styleUrls: ['./dialog-delete-story.component.css']
})
export class DialogDeleteStoryComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogDeleteStoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
