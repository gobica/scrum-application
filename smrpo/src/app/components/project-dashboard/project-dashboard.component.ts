import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddSprintDialogComponent } from '../add-sprint-dialog/add-sprint-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  projektID;
  sprints = [];

  constructor(private dialog: MatDialog,
    
    private sprintService: SprintService,
    private route: ActivatedRoute

    ) {
    
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projektID = params.id;
      console.log("id od projekta 22222", params.id );

  });
  this.loadAllSprints();
  console.log(this.sprints);
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    //passing data
    dialogConfig.data = {
      id: this.projektID
      
  };

    //this.dialog.open(AddSprintDialogComponent, dialogConfig);

    const dialogRef = this.dialog.open(AddSprintDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
        data => {console.log("Dialog output:", data)
        this.loadAllSprints();
    }
    );    


}


private loadAllSprints() {
  this.sprintService.getAll(this.projektID)
      .pipe(first())
      .subscribe(sprints => this.sprints = sprints);
}

}
