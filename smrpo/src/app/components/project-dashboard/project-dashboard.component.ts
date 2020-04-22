import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddSprintDialogComponent } from '../add-sprint-dialog/add-sprint-dialog.component';
import { AddUserStoryComponent } from '../add-user-story/add-user-story.component';

import { Router, ActivatedRoute } from '@angular/router';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';
import {AuthenticationService} from "../../services/authentication.service";
import { ProjectService } from '../../services/project.service';
import { StoryService } from  '../../services/story.service';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  projektID;
  sprints = [];
  stories = [];

  trenutniProjekt; 
  userLoaded = false;
  jeTreuntuniSprint; 


  constructor(
    //sprint dialog
    private dialogSprint: MatDialog,
    private sprintService: SprintService,
    //story dialog
    private dialogStory: MatDialog,
    private storyService: StoryService,
    // to get Project ID
    private route: ActivatedRoute,
    public authenticationService: AuthenticationService,  
    private projectService: ProjectService,
    ) {
    
  }
  ngOnInit(): void {
    //get project ID
    this.route.params.subscribe(params => {
      this.projektID = params.id;
  });

  // get project by id
  this.getCurrentProject(this.projektID);
  this.loadAllSprints();
  this.loadAllStories();

  

  }

  openSprintDialog() {

    const dialogConfigSprint = new MatDialogConfig();
    dialogConfigSprint.disableClose = true;
    dialogConfigSprint.autoFocus = true;
  //  console.log("USERNAME", this.trenutniProjekt.scrumMaster.username);
    //console.log(" PROJEKT V DIALOG", this.trenutniProjekt);
    //passing data
    dialogConfigSprint.data = {
      id: this.projektID
  };
    //this.dialog.open(AddSprintDialogComponent, dialogConfig);
    const dialogRefSprint = this.dialogSprint.open(AddSprintDialogComponent, dialogConfigSprint);
    dialogRefSprint.afterClosed().subscribe(
        data => {console.log("Dialog output:", data)
        this.loadAllSprints();
    }
    );    
}


openStoryDialog() {

  const dialogConfigStory = new MatDialogConfig();
  dialogConfigStory.disableClose = true;
  dialogConfigStory.autoFocus = true;
  dialogConfigStory.width = "50vh"; 
  dialogConfigStory.maxHeight = "80vh"; 



//  console.log("USERNAME", this.trenutniProjekt.scrumMaster.username);
  //console.log(" PROJEKT V DIALOG", this.trenutniProjekt);

  //passing data
  dialogConfigStory.data = {
    id: this.projektID
};

  //this.dialog.open(AddSprintDialogComponent, dialogConfig);

  const dialogRefStory = this.dialogStory.open(AddUserStoryComponent, dialogConfigStory);
  dialogRefStory.afterClosed().subscribe(
      data => {console.log("Dialog output:", data)
      this.loadAllStories() 
  }
  );    



}


private loadAllStories() {
  this.storyService.getAll(this.projektID)
      .pipe(first())
      .subscribe(stories => this.stories = stories);
}

private loadAllSprints() {
  this.sprintService.getAll(this.projektID)
      .pipe(first())
      .subscribe(sprints => this.sprints = sprints);
}
public beautifySprints(date) {
  var currentDate  = new Date(date);
  var izpis = currentDate.getDate() + ". " + currentDate.getMonth()  + ". " +  currentDate.getFullYear(); 
  return izpis;


}
private getCurrentProject (id: number) {
    // get project by id
    this.projectService.getProject(this.projektID)
    .pipe(first())
    .subscribe(project => this.trenutniProjekt =  project);
}
public  isCurrentSprint(sprint) {
  // your date logic here, recommend moment.js;
  var currentDate  = new Date();
  var startDate = new Date(sprint.startDate);
  var endDate =  new Date(sprint.endDate);
  console.log ("Start", startDate, "current", currentDate);
  
if ( startDate < currentDate && currentDate < endDate) 
  {
    console.log("TRENUTNISPRINT")
   return true; 
  }

 // else return false; 

  }


}
