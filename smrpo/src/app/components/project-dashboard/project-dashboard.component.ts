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
import {TaskService} from "../../services/task.service";

import {DatePipe} from '@angular/common';

import dayGridPlugin from '@fullcalendar/daygrid';
import {orange} from "color-name";

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.css']
})
export class ProjectDashboardComponent implements OnInit {
  formSetSize: FormGroup;
  projektID;
  sprintID;
  sprints = [];
  stories = [];
  allTasks = [];
  submittedSize = false;
  loading = false; 
  isSizeEnabled = [];
  remainingPtsSize = 0;
  
  selectedStories = 'all';

  calendarPlugins = [dayGridPlugin];
  showHideCalendar = false;
  showHideSprintStories = true;
  sprintsInCalendar = [];

  trenutniUporabnik = this.authenticationService.currentUserValueFromToken.username;
  globalnaUloga = this.authenticationService.currentUserValueFromToken.globalRole;

  trenutniProjekt;
  trenutniProjektIme = "";
  userLoaded = false;
  jeTreuntuniSprint;

  displayedColumns: string[] = ['description','state'];
  // displayedColumnsSprint: string[] = ['duration','velocity'];


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
    private taskService: TaskService,
    private router: Router,
    private alertService: AlertService,

    private datePipe: DatePipe
    ) {
    
  }
  get f() { return this.formSetSize.controls; }

  ngOnInit(): void {

    this.formSetSize = this.formBuilder.group({
      sizePts: [,   [Validators.min(1), Validators.max(1000)]]



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

    // this.stories.forEach(s => {
    //   this.getAllTasks(s.id);
    //   console.log("---", this.allTasks);
    // });
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
        this.loadTasksOfSprintStories(stories);

        for (var i = 0; i<stories.length; i++) {
          this.isSizeEnabled.push(false);
        }
        // console.log(stories);
        let index = 1;
        this.stories.forEach(s => {
          if(s.priority === "must have"){
            s.priorityColor = "warn";
          }
          else if(s.priority === "should have"){
            s.priorityColor = "primary";
          }
          else if(s.priority === "could have"){
            s.priorityColor = "primary";
          }
          else {
            s.priorityColor = "secondary";
          }
          s.index = index;
          index += 1;
        });
        this.stories = this.stories.sort((a, b) => (a.businessValue < b.businessValue) ? 1 : -1);
        this.remainingPts(this.getCurrentSprint());

      });




}

private loadAllSprints() {
  this.sprintService.getAll(this.projektID)
      .pipe(first())
      .subscribe(sprints => {
        this.sprints = sprints;

        // sprinti v coledarju
        this.sprints.forEach(s => {
          // console.log(s);
          let startDay = s.startDate;
          startDay = new Date(startDay); //new Date().setDate(todayDate.getDate()+1)
          startDay.setDate(startDay.getDate());
          startDay = this.datePipe.transform(startDay,"yyyy-MM-dd");
          // console.log(startDay);
          let endDay = s.endDate; //.substr(0, 10);
          endDay = new Date(endDay); //new Date().setDate(todayDate.getDate()+1)
          endDay.setDate(endDay.getDate());
          endDay = this.datePipe.transform(endDay,"yyyy-MM-dd"); //this.datePipe.transform(date,"yyyy-MM-dd")
          // console.log(endDay);
          let ze = false;
          this.sprintsInCalendar.forEach(c => {
            if(s.id === c.id) {
              ze = true;
            }
          });
          if(ze === false) {
            this.sprintsInCalendar.push({
              id: s.id,
              title: 'Velocity ' + s.velocity,
              start: startDay,
              end: endDay,
              backgroundColor: '#fc7b03',
              borderColor: '#fc7b03',
              textColor: '#ffffff'
            });
          }
        });
        // console.log("---");
        // console.log(this.sprintsInCalendar);

      });



}
public beautifySprints(date) {
  var currentDate  = new Date(date);
  var izpis = currentDate.getDate() + ". " + (currentDate.getMonth() + 1) + ". " +  currentDate.getFullYear(); 
  return izpis;
}

public isStoryInCurrentSprint(story) {
  if(this.getCurrentSprint()) {
   // console.log("ternnutni sprint", this.getCurrentSprint());
    for (var i = 0; i < this.getCurrentSprint().stories.length; i++) {
      if (story.id == this.getCurrentSprint().stories[i].id) { 
        return true;      
      }
    }
  }      
  return false; 
}

public isFinishedInSprint( sprintID) {
   // console.log("ternnutni sprint", this.getCurrentSprint());
    for (var i = 0; i <this.stories.length; i++) {
      if (this.stories[i].idSprintCompleted == sprintID) { 
        console.log("ja je");
        return true;      
      }
    }
      
  return false; 
}



/*


public isStoryInSprintReady (idStory) {
  // get project by id
  var isReady_;
  var sprint = this.getCurrentSprint();
  var idSprint = sprint.id;

    this.sprintService.getSprint(this.projektID, idSprint)
        .pipe(first())
        .subscribe(data => {
          for (var i = 0; i < data.stories.length; i++) {
            if (idStory == data.stories[i].id) { 
              isReady_ = data.stories[i].SprintStory.isReady;   
            }
          } 
          console.log(isReady_);
        }
        
        );
  return isReady_;
}
*/

public addStoryToSprint (story: Story) {
  console.log(story);
  // get project by id
  var sprint = this.getCurrentSprint();
  var idSprint = sprint.id;

  this.sprintService.addStorytoSprint(this.projektID, idSprint, story.id )
  .pipe(first())
  .subscribe(
      (data:any) => {
      //  this.loadAllSprints();
        this.loadAllStories();
        this.loadAllSprints();

        console.log(this.getCurrentSprint());
          this.alertService.success('Story added to sprint successful', true);
          
      },
      error => {

          this.alertService.error(error);
      });
}




private updateStoryAPI (story: Story) {
  // get project by id
  this.storyService.updateStory(story, this.projektID)
  .pipe(first())
  .subscribe(
      (data:any) => {
          this.alertService.success('Story Updated', true);
      },
      error => {

          this.alertService.error(error);
      });
}

// ZGODBA ZA SUBBMITAT SIZE
public SubmitSizePts (story: Story, i) {
    this.submittedSize = true;
    this.alertService.clear();

    if (this.formSetSize.invalid) {
      return;
  }
    // reset alerts on submit
    story.sizePts = this.formSetSize.value.sizePts;
    console.log("form", this.formSetSize.value.sizePts);
    console.log(story.sizePts);
    this.loading = true;
    this.storyService.updateStory(story, this.projektID)
        .pipe(first())
        .subscribe(
            (data:Story) => {
          
                this.alertService.success('Changed Size successful', true);
                this.isSizeEnabled[i] = false; 
            },
            error => {

                this.alertService.error(error);
                this.loading = false;
            });
}


// ZGODBA ZA SUBBMITAT isAccepted
public SubmitIsAccepted (story,  sprintID, valueIsAccepted) {
  this.alertService.clear();
  var storyID = story.id
  console.log("to se posle",this.sprints);
  
  var values = {
    isAccepted: valueIsAccepted
    };
  
  this.storyService.updateIsAcceptedOrIsReady(values, this.projektID, sprintID, storyID)
      .pipe(first())
      .subscribe(
          (data:any) => {
            if (valueIsAccepted == true) this.alertService.success('Story is Accepted!', true);
            if (valueIsAccepted == false) this.alertService.success('Story is "unfinished"!', true);
            this.loadAllStories();
            this.loadAllSprints();
            
          },
          error => {
              console.log("eeror");

              this.alertService.error(error);
          });
}

//set story to read


public SubmitIsReady (story, sprintID, valueIsReady ) {
  this.alertService.clear();
  console.log(sprintID);
  var storyID = story.id;
 
  // reset alerts on submit
  console.log("story", story);
  var values = {
    isReady: valueIsReady
    };
  story.isReady = valueIsReady;
  
  this.storyService.updateIsAcceptedOrIsReady(values, this.projektID, sprintID, storyID)
      .pipe(first())
      .subscribe(
          (data:any) => {
            console.log(data);
            if (valueIsReady == true) this.alertService.success('Story is ready!', true);
            if (valueIsReady == false) this.alertService.success('Story is not ready!', true);
            this.loadAllStories();
            this.loadAllSprints();

          },
          error => {
              console.log("eeror");

              this.alertService.error(error);
          });
}


//UPDATE STORY ------------------------------------- TO DO ----------------------






private getCurrentProject (id: number) {
    // get project by id
    this.projectService.getProject(this.projektID)
    .pipe(first())
    .subscribe(project => {
      this.trenutniProjekt =  project;
      this.trenutniProjektIme = this.trenutniProjekt.name;
    });
}
public  isCurrentSprint(sprint) {
  // your date logic here, recommend moment.js;
  var currentDate  = new Date();
  var startDate = new Date(sprint.startDate);
  startDate.setHours(0,0,0,0);
  
  var endDate =  new Date(sprint.endDate);
  endDate.setHours(0,0,0,0);  
  currentDate.setHours(0,0,0,0);

  
  
if ( startDate <= currentDate && currentDate <= endDate) 
  {
   return true; 
  }

  else return false; 

  }

public getCurrentSprint() {
  for (var i = 0; i < this.sprints.length; i++) {
    if (this.isCurrentSprint(this.sprints[i])) {
      return this.sprints[i];
    }
  }

  return null;
}

loadTasksOfSprintStories(sto){
  sto.forEach(s => {
      this.getAllTasks(s.id);
  });
  // console.log(this.allTasks);
}

getAllTasks(zgodbaID) {
    // let projects = [];
    var sprint = this.getCurrentSprint();
    if(sprint != null) {
      var sprintId = sprint.id;
      this.taskService.getAllTasksOfStory(this.projektID, sprintId, zgodbaID).pipe(first()) // vrne vse naloge
        .subscribe(
          data => {
            // console.log(data);
            let ze = false;
            this.allTasks.forEach(t => {
              if(t.story === zgodbaID){
                ze = true;
              }
            });
            if(ze === false){
              this.allTasks.push({story: zgodbaID, tasks: data});
            }
            return data;
          },
          error => {
            let ze = false;
            this.allTasks.forEach(t => {
              if(t.story === zgodbaID){
                ze = true;
              }
            });
            if(ze === false){
              this.allTasks.push({story: zgodbaID, tasks: null});
            }
            // console.log(error);
            console.log("Story with ID ", zgodbaID, " doesn't have tasks :)");
            this.loading = false;
          }
        );
    } else {
      let ze = false;
      this.allTasks.forEach(t => {
        if(t.story === zgodbaID){
          ze = true;
        }
      });
      if(ze === false){
        this.allTasks.push({story: zgodbaID, tasks: null});
      }

    }
  }

hashTest(text){
  text = "# "+text;
  text = text.replace(/\n/g, "\n# ");
  return text;
}

public btnShowStory = function(projectId, storyId) {
  // console.log(projectId, storyId);
  var sprintId = this.getCurrentSprint().id;
  console.log(this.getCurrentSprint());
  this.alertService.clear();
  this.router.navigateByUrl('/projectDashboard/' + projectId + '/sprint/' + sprintId + '/story/' + storyId + '/showTask');

    // console.log(id);
};

remainingPts(sprint) {
  let allPts = 0;
  if(sprint != null && sprint != undefined) {
    let zgodbe = sprint.stories;
    let velocity = sprint.velocity;
    zgodbe.forEach(z => {
      allPts += z.sizePts;
    });
    this.remainingPtsSize = velocity - allPts;
  }

}

showCalendar() {
  this.showHideCalendar = true;

  //v koledarju bo zelen, ce je current sprint
  console.log(this.sprintsInCalendar);
  let currentSprint = this.getCurrentSprint();
  this.sprintsInCalendar.forEach(c =>{
    if(c.id === currentSprint.id) {
      c.backgroundColor =  "#12a102";
      c.borderColor = "#12a102";
      console.log(c);
    }
  });

}

hideCalendar() {
  this.showHideCalendar = false;
}

showSprintStories() {
  this.showHideSprintStories = true;
}

hideSprintStories() {
  this.showHideSprintStories = false;
}

print(nekaj){
  console.log(nekaj);
}

}
