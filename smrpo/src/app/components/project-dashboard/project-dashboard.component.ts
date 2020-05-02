import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddSprintDialogComponent } from '../add-sprint-dialog/add-sprint-dialog.component';
import { AddUserStoryComponent } from '../add-user-story/add-user-story.component';
import { AlertService } from '../../services/alert.service';
import { Story } from '../../models/story'

import { Router, ActivatedRoute } from '@angular/router';
import { SprintService } from  '../../services/sprint.service';
import { first } from 'rxjs/operators';
import {AuthenticationService} from "../../services/authentication.service";
import { ProjectService } from '../../services/project.service';
import { StoryService } from  '../../services/story.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  formSetSize: FormGroup;
  projektID;
  sprints = [];
  stories = [];
  submittedSize = false;
  loading = false; 
  isSizeEnabled = false; 

  selectedStories = 'all';

  //TODO: premakni v sprintBacklog
  trenutniUporabnik = this.authenticationService.currentUserValueFromToken.username;
  globalnaUloga = this.authenticationService.currentUserValueFromToken.globalRole;

  trenutniProjekt;
  userLoaded = false;
  jeTreuntuniSprint; 


  constructor(
    private formBuilder: FormBuilder,

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
    private router: Router,
    private alertService: AlertService,
    ) {
    
  }
  ngOnInit(): void {

    this.formSetSize = this.formBuilder.group({
      sizePts: [,  Validators.min(0)]

      }),
    //get project ID
    this.route.params.subscribe(params => {
      this.projektID = params.id;
    }
    );
    // get project by id
    this.getCurrentProject(this.projektID);
    this.loadAllSprints();
    this.loadAllStories();
  }

  openSprintDialog() {
    this.alertService.clear();

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
        data => {console.log("Dialog output:", data);
        this.loadAllSprints();
    }
    );    
}


openStoryDialog() {
  this.alertService.clear();

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
      data => {console.log("Dialog output:", data);
      this.loadAllStories() 
  }
  );    



}


private loadAllStories() {
  this.storyService.getAll(this.projektID)
      .pipe(first())
      .subscribe(stories => {
        this.stories = stories;
        // console.log(stories);
        let index = 1;
        this.stories.forEach(s => {
          if(s.priority === "must have"){
            s.priorityColor = "warn";
            s.category = "finished"; //TODO: zbrisat
          }
          else if(s.priority === "should have"){
            s.priorityColor = "primary";
            s.category = "assigned"; //TODO: zbrisat
          }
          else if(s.priority === "could have"){
            s.priorityColor = "primary";
            s.category = "unassigned"; //TODO: zbrisat
          }
          else {
            s.priorityColor = "";
          }
          s.acceptanceTests = "# "+s.acceptanceTests;
          s.acceptanceTests = s.acceptanceTests.replace(/\n/g, "\n# ");
          s.index = index;
          index += 1;
        });
        this.stories = this.stories.sort((a, b) => (a.businessValue < b.businessValue) ? 1 : -1);
      });


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




public addStoryToSprint (idOfStory: number) {
  // get project by id
  var idSprint = this.getCurrentSprint().id;
  console.log(idSprint);
  this.sprintService.addStorytoSprint(this.projektID, idSprint, idOfStory )
  .pipe(first())
  .subscribe(
      (data:any) => {

          this.alertService.success('Story added to sprint successful', true);
      },
      error => {
          console.log("eeror");

          this.alertService.error(error);
      });
}

private updateStoryAPI (story: Story) {
  // get project by id
  console.log("a sam pride?")
  this.storyService.updateStory(story, this.projektID)
  .pipe(first())
  .subscribe(
      (data:any) => {

          this.alertService.success('Story Updated', true);
      },
      error => {
          console.log("eeror");

          this.alertService.error(error);
      });
}

// ZGODBA ZA SUBBMITAT SIZE
public SubmitSizePts (story: Story) {
    this.submittedSize = true;

    if (this.formSetSize.invalid) {
      return;
  }
    // reset alerts on submit
    this.alertService.clear();
    story.sizePts = this.formSetSize.value.sizePts;

    this.loading = true;
    this.storyService.updateStory(story, this.projektID)
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

get f() { return this.formSetSize.controls; }

//UPDATE STORY ------------------------------------- TO DO ----------------------






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
  // console.log ("Start", startDate, "current", currentDate);
  
if ( startDate < currentDate && currentDate < endDate) 
  {
    console.log("TRENUTNISPRINT");
   return true; 
  }

 // else return false; 

  }

public getCurrentSprint() {
  for (var i = 0; i < this.sprints.length; i++) {
    if (this.isCurrentSprint(this.sprints[i])) {
      return this.sprints[i];
    }
  }
  return null;
}

public btnShowStory = function(projectId, storyId) { // bo moralo it v sprint backlog!!!!!!!!!!!!!!!!! //TODO: mora it v sprint backlog
  // console.log(projectId, storyId);
  this.alertService.clear();
  this.router.navigateByUrl('/projectDashboard/' + projectId + '/sprint/' + 1 + '/story/' + storyId + '/showTask');

    // console.log(id);
};

}
