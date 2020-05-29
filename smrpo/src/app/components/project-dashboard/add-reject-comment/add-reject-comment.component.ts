import { Component, OnInit, Input, NgModule } from '@angular/core';
import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../../services/alert.service';

export interface DialogData {
  reviewComment: string;

}

@Component({
  selector: 'app-add-reject-comment',
  templateUrl: './add-reject-comment.component.html',
  styleUrls: ['./add-reject-comment.component.css']
})
export class AddRejectCommentComponent implements OnInit {
  formComment: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,

    public dialogRef: MatDialogRef<AddRejectCommentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

    }



    get f() { return this.formComment.controls; }

 
    ngOnInit(): void {
      this.formComment = this.formBuilder.group({
        reviewComment: ['', Validators.required],
  
        
  
    },);
      
    }
  
    save() {
      this.dialogRef.close(this.formComment.value);
      
  }
  close() {
      this.dialogRef.close();
  } 


  

onSubmit() {
  this.submitted = true;

  // reset alerts on submit
  this.alertService.clear();

  // stop here if form is invalid
  if (this.formComment.invalid) {
      return;
  }
  this.loading = true;
  this.loading = true;
  var reviewComment = this.formComment.value.reviewComment;

  // send last milisecond to datbase
  this.dialogRef.close({ data: reviewComment });

}
}

  
