import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../services/alert.service';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-add-sprint-dialog',
  templateUrl: './add-sprint-dialog.component.html',
  styleUrls: ['./add-sprint-dialog.component.css']
})
export class AddSprintDialogComponent implements OnInit {
  form: FormGroup;
  startDate: number; 
  endDate: number; 
  velocity: number;
  submitted = false;
  loading = false;
  idProject: number;
  public projektID;

  currentDate  = new Date();
  minDate ;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sprintService: SprintService,
    private dialogRef: MatDialogRef<AddSprintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.idProject = data.id;

    }
    get f() { return this.form.controls; }


  ngOnInit(): void { 
  //  console.log("CURRENT DATE", this.currentDate);


    this.form = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      velocity: ['', [Validators.min(1), Validators.required]]


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
  if (date)
  return new Date (date.getTime() + 24 *  60 * 60 * 1000 )
} 




onSubmit() {
  this.submitted = true;

  // reset alerts on submit
  this.alertService.clear();

  // stop here if form is invalid
  if (this.form.invalid) {
      return;
  }
  this.loading = true;
  this.loading = true;
  // send last milisecond to datbase
  var sprint = this.form.value;
  console.log("ta sprint se doda", sprint)
  this.sprintService.addSprint(this.form.value, this.idProject)
      .pipe(first())
      .subscribe(
          (data:any) => {

              this.alertService.success('Sprint added successfuly', true);
              this.dialogRef.close(this.form.value);

             // console.log("DATA", data);
              
          },
          error => {
             // console.log("error");

              this.alertService.error(error);
              this.loading = false;
          });
        

}

}