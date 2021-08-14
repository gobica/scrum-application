import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  checked: Boolean;
}

@Component({
  selector: 'dialog-uncompleted-task',
  templateUrl: 'dialog-uncompleted-task.component.html',
})
export class DialogUncompletedTaskComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogUncompletedTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
