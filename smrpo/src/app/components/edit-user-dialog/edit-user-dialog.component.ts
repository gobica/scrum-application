import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditUserDialogComponent>) 
    { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }
  

}
