import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  checked: Boolean;
}

@Component({
  selector: 'dialog-giveup-task',
  templateUrl: 'dialog-giveup-task.component.html',
})
export class DialogGiveupTaskComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogGiveupTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
