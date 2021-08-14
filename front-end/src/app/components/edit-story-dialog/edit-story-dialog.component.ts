import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../services/alert.service';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { StoryService } from  '../../services/story.service';
import { first } from 'rxjs/operators';
import {Story} from '../../models/story'
@Component({
  selector: 'app-edit-story-dialog',
  templateUrl: './edit-story-dialog.component.html',
  styleUrls: ['./edit-story-dialog.component.css']
})
export class EditStoryDialogComponent implements OnInit {

  formStory: FormGroup;
  idProject: number;
  submitted = false;
  storyOld: Story;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private storyService: StoryService,

    private dialogRef: MatDialogRef<EditStoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) 
    {
      this.idProject = data.projectId;
      this.storyOld = data.storyOld;
    }
    get f() { return this.formStory.controls; }


  ngOnInit(): void {
    this.formStory = this.formBuilder.group({
      name: [''],
      description: [''],
      acceptanceTests: [''],
      priority: [''],
      businessValue: [],
      sizePts: []

      

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

  this.storyService.updateStory(this.idProject, this.storyOld.id, this.formStory.value, )
      .pipe(first())
      .subscribe(
          (data:any) => {

              this.alertService.success('Story edited successfuly.', true);
              console.log("DATA", data);
              this.dialogRef.close(this.formStory.value);

              
          },
          error => {
             // console.log("error");

              this.alertService.error(error);
          });
        

}

}