import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  checked: Boolean;
}

@Component({
  selector: 'dialog-accept-task',
  templateUrl: 'dialog-accept-task.component.html',
})
export class DialogAcceptTaskComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogAcceptTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
