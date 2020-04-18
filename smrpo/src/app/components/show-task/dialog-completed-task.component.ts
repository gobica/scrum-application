import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  checked: Boolean;
}

@Component({
  selector: 'dialog-completed-task',
  templateUrl: 'dialog-completed-task.component.html',
})
export class DialogCompletedTaskComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogCompletedTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick() {
    // console.log(value);
    // console.log(this.data.checked);
    // this.data.checked = value;
    // console.log(this.data.checked);
    this.dialogRef.close();
    // return this.data.checked;
  }

  // onYesClick(value): void {
  //   console.log(value);
  //   this.data.checked = value;
  //   this.dialogRef.close();
  // }

}
