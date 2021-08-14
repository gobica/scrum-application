import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../services/alert.service';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';
import { SprintBacklogComponent } from '../sprint-backlog/sprint-backlog.component';
import {Sprint} from '../../models/sprint';

@Component({
  selector: 'app-edit-sprint-dialog',
  templateUrl: './edit-sprint-dialog.component.html',
  styleUrls: ['./edit-sprint-dialog.component.css']
})
export class EditSprintDialogComponent implements OnInit {
  form: FormGroup;
  startDate: number; 
  endDate: number; 
  velocity: number;
  submitted = false;
  loading = false;
  idProject: number;
  public oldSprint: Sprint;
  isCurrentSprint; 
  public projektID;

  currentDate  = new Date();
  minDate ;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sprintService: SprintService,
    private dialogRef: MatDialogRef<EditSprintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.idProject = data.projectId;
    this.oldSprint = data.sprintOld;
    this.isCurrentSprint = data.isCurrentSprint;
    }
    get f() { return this.form.controls; }


  ngOnInit(): void { 


    this.form = this.formBuilder.group({
      startDate: [''],
      endDate: [''],
      velocity: ['', Validators.min(1) ]


  },);


  }
  
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.minDate = (`${event.value}`);
  }

  save() {
    this.dialogRef.close(this.form.value);
    
}
close() {
    this.dialogRef.close();
} 
incrementDay(date) {
  console.log(" to je datum", date);
  console.log("new date", new Date(date));
  if (date) {
    date= new Date (date);
    var date_new = new Date (date.getTime() + 24 *  60 * 60 * 1000);
    console.log("to vrne", date_new);
    return date_new;
  }
} 

public beautifySprints(date) {
  var currentDate  = new Date(date);
  var izpis = currentDate.getDate() + ". " + (currentDate.getMonth() + 1) + ". " +  currentDate.getFullYear(); 
  return izpis;
}




onSubmit() {
  this.submitted = true;

  // reset alerts on submit
  this.alertService.clear();

  // stop here if form is invalid
  if (this.form.invalid) {
      return;
  }
  var idSprint = this.oldSprint.id
  this.loading = true;
  this.loading = true;
  // send last milisecond to datbase
  console.log(this.form.value);
  this.sprintService.updateSprint(this.idProject, idSprint, this.form.value)
      .pipe(first())
      .subscribe(
          (data:any) => {

              this.alertService.success('Sprint added successfuly', true);
              this.dialogRef.close(this.form.value);

              console.log("DATA", data);
              
          },
          error => {
             // console.log("error");

              this.alertService.error(error);
              this.loading = false;
          });
        

}

}