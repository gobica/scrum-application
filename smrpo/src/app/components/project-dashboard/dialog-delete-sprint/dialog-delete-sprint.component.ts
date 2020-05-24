

import { Component, OnInit, Input, NgModule } from '@angular/core';


import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';



export interface DialogData {

}

@Component({
  selector: 'dialog-delete-sprint',
  templateUrl: 'dialog-delete-sprint.component.html',
})
export class DialogDeleteSprintComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogDeleteSprintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

}
