import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../services/alert.service';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { StoryService } from  '../../services/story.service';
import { first } from 'rxjs/operators';
@Component({
  selector: 'app-add-user-story',
  templateUrl: './add-user-story.component.html',
  styleUrls: ['./add-user-story.component.css']
})
export class AddUserStoryComponent implements OnInit {
  formStory: FormGroup;
  idProject: number;
  submitted = false;


  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storyService: StoryService,

    private dialogRef: MatDialogRef<AddUserStoryComponent>,
    @Inject(MAT_DIALOG_DATA) data) 
    {
      this.idProject = data.id;
  
    }
    get f() { return this.formStory.controls; }


  ngOnInit(): void {
    this.formStory = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      acceptanceTests: ['', Validators.required],
      priority: ['', Validators.required],
      businessValue: ['', [Validators.min(1), Validators.required]],
      sizePts: [,   [Validators.min(1), Validators.max(1000)]]

      

  },);
    
  }
  close() {
    this.dialogRef.close();
} 


onSubmit() {
  this.submitted = true;

  // reset alerts on submit
  this.alertService.clear();

  // stop here if form is invalid
  if (this.formStory.invalid) {
      return;
  }

  this.storyService.addStory(this.formStory.value, this.idProject)
      .pipe(first())
      .subscribe(
          (data:any) => {

              this.alertService.success('Story added successfuly.', true);
              console.log("DATA", data);
              this.dialogRef.close(this.formStory.value);

              
          },
          error => {
             // console.log("error");

              this.alertService.error(error);
          });
        

}

}