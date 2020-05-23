import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {
  name: String;
  time: String;
  closed: Boolean;
}

@Component({
  selector: 'dialog-time',
  templateUrl: 'dialog-time.component.html',
})
export class DialogTimeComponent {

  displayedLogTime: string[] = ['date','hour'];

  constructor(
    public dialogRef: MatDialogRef<DialogTimeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  print(nekaj){
    console.log(nekaj);
  }
}

