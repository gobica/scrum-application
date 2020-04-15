import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA} from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService,  } from '../../services/alert.service';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';


import { ShowProjectComponent } from  '../showProject/showProject.component';


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
  maxDate = new Date(2019, 0, 1);

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private sprintService: SprintService,
    private router: Router,
    private fb: FormBuilder,   
    private route: ActivatedRoute,


    private dialogRef: MatDialogRef<AddSprintDialogComponent>,

    @Inject(MAT_DIALOG_DATA) data) {


    this.idProject = data.id;


    }
    get f() { return this.form.controls; }


  ngOnInit(): void { 
    console.log("lalalalal", this.idProject)


    this.form = this.formBuilder.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      velocity: ['', Validators.required]


  },);




  }
  
  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(`${event.value}`);
    this.minDate = (`${event.value}`);
    console.log("date", this.minDate);
  }

  save() {
    this.dialogRef.close(this.form.value);
    
}
close() {
    this.dialogRef.close();
} 



onSubmit() {
  this.submitted = true;
  console.log("trenutni datum", this.minDate);

  // reset alerts on submit
  this.alertService.clear();

  // stop here if form is invalid
  if (this.form.invalid) {
      return;
  }
  this.loading = true;
  this.dialogRef.close(this.form.value);
  this.loading = true;
  
  this.sprintService.addSprint(this.form.value, this.idProject)
      .pipe(first())
      .subscribe(
          (data:any) => {

              this.alertService.success('Registration successful', true);
              console.log("DATA", data);
              
          },
          error => {
              console.log("eeror");

              this.alertService.error(error);
              this.loading = false;
          });
        

}

}