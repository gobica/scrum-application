import { Component, OnInit, Input, NgModule } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {first} from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import {group} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import { AuthenticationService } from  '../../services/authentication.service';
import { ProjectService } from '../../services/project.service';
import {UserService} from '../../services/user.service';
import {StoryService} from "../../services/story.service";
import { TaskService } from '../../services/task.service';

import {Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DialogCompletedTaskComponent } from './dialog-completed-task.component';
import { DialogUncompletedTaskComponent } from './dialog-uncompleted-task.component';
import { DialogAcceptTaskComponent } from './dialog-accept-task.component';
import { DialogGiveupTaskComponent } from './dialog-giveup-task.component';
import { DialogRedirectTaskComponent } from './dialog-redirect-task.component';
import { DialogTimeComponent } from './dialog-time.component';

import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


@Component({
  selector: 'app-show-task',
  templateUrl: './show-task.component.html',
  styleUrls: ['./show-task.component.css']
})
export class ShowTaskComponent implements OnInit {
  public projektID;
  public sprintID;
  public zgodbaID;
  zgodbaIme = "";

  trenutniUporabnik = this.authenticationService.currentUserValueFromToken.username;
  trenutniUporabnikId = this.authenticationService.currentUserValueFromToken.id;

  loading = false;
  submitted = false;

  allUsers = [];
  allProjects = [];
  allStories = [];
  errors = [];
  // allTasks = [{check: false, description: 'Prva naloga je lepa', size: 2.5, user: 'roberto'}, {check: false, description: 'Druga naloga je zanimiva', size: 3.0, user: ''}, {check: false, description: 'Tretja naloga je dolgočasna', size: 4.5, user: 'samantha'}];
  allTasks = [];
  project;
  jeTeamMember;

  allTime = [{date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-15", hour: 5}, {date: "2020-05-16", hour: 7},
    {date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-16", hour: 7}, {date: "2020-05-15", hour: 5}, {date: "2020-05-16", hour: 7}];
  // allTime = [];

  userNameTeamMember: string[] = [];
  // filteredOptionsTeamMember: Observable<string[]>[] = [];

  public myForm: FormGroup;
  public taskForm: FormGroup;


  constructor(
    private _fb: FormBuilder,
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private projectService: ProjectService,
    private storyService: StoryService,
    private taskService: TaskService,
    public dialog: MatDialog,
    private route: ActivatedRoute,

  ) {
     // redirect to home if already logged in
     // if (this.authenticationService.currentUserValueFromToken.globalRole === 'user') {
     //  this.router.navigate(['/']);
     // }
    console.log(this.authenticationService.currentUserValueFromToken.globalRole);

  }

  ngOnInit() {
    // this.myForm = this._fb.group({
    //   tasks: this._fb.array([
    //   this.initTasks(),
    //   ])
    // });
    // this.taskForm = this._fb.group({
    //   task: this.myForm,
    // });
    this.getAllUsers();
    this.getAllProjects();

    this.route.params.subscribe(params => {
      // console.log(params);
      this.projektID = params.projectId; //projectDashboard/:projectId/sprint/:sprintId/story/:storyId/showTask
      this.sprintID = params.sprintId;
      this.zgodbaID = params.storyId;

      this.getAllProjectUsers();

    });
    this.getAllStories();
    this.getAllTasks();

  }

  // private _filterTeamMember(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //
  //   return this.userNameTeamMember.filter(userNameTeamMember => userNameTeamMember.toLowerCase().indexOf(filterValue) === 0);
  // }

  getAllUsers() {
    // let users = [];
    this.userService.getAll().pipe(first()) // vrne vse uporabnike v bazi
    .subscribe(
      data => {
          // console.log(data);
          this.allUsers = data;

          // const users = [];
          // data.forEach(u => {
          //   users.push(u.username);
          // });
          // this.userNameTeamMember = users;

          return data;
      },
      error => {
          this.alertService.error(error);
          this.loading = false;
      }
    );
    // return users;
  }

  getAllProjects() {
    // let projects = [];
    this.projectService.getAllProjects().pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          this.allProjects = data;
          return data;
      },
      error => {
          // this.alertService.error(error);
          this.loading = false;
      }
    );
    // return projects;
  }

  getAllProjectUsers() {
    this.projectService.getProject(this.projektID).pipe(first()) // vrne projekt, ki ima dolocen id
        .subscribe(
          data => {
              // console.log('----------');
              // console.log(data);
              // console.log('----------');
              this.project = data;
              const projectUsers = this.project.users;
              // console.log(this.projectUsers);
              const users = [];
              projectUsers.forEach(u => {
                users.push(u.username);
              });
              this.userNameTeamMember = users;
              // console.log(this.userNameTeamMember);
              this.jeTeamMember = this.isIn(this.userNameTeamMember, this.trenutniUporabnik);
              return data;
          },
          error => {
              this.alertService.error(error);
              this.loading = false;
          }
        );

  }

  isIn(vsiUporabniki, uporabnik){
    let jeVBazi = false;
    vsiUporabniki.forEach(u => {
      if(u === uporabnik) {
        jeVBazi = true;
      }
    });
    // console.log(vsiUporabniki);
    // console.log(uporabnik);
    // console.log(jeVBazi);
    return jeVBazi;
  }

  getAllStories() {
  this.storyService.getAll(this.projektID)
      .pipe(first())
      .subscribe(stories => this.allStories = stories);
}

  async getAllTasks() {
    // let projects = [];
    await this.taskService.getAllTasksOfStory(this.projektID, this.sprintID, this.zgodbaID).pipe(first()) // vrne vse naloge
    .subscribe(
      data => {
          // console.log(data);
          this.allTasks = data;
          this.allTasks.forEach(t => {
            this.allUsers.forEach(u => {
              // console.log(u.username);
              // console.log(t.assignedUser);
              if(t.assignedUser != "" && t.assignedUser != null && t.assignedUser != undefined &&
                u.id === t.assignedUser.id){

                t.user = u.username; // doda novo polje v task! POZOR!
              }
            });
            // console.log(t);
            t.userWork = false; //TODO: zbriši ko bo v bazi :)
          });
          // console.log(this.allProjects);
          const ime = this.allStories.find(x => {
            // console.log(x);
            // console.log(this.zgodbaID);
            if(x.id === parseInt(this.zgodbaID)){
              return x;
            }
          });
          this.zgodbaIme = ime.name;
          // console.log("---"+this.zgodbaIme);
          return data;
      },
      error => {
          if (error === 'Not Found') {
            this.alertService.warning('No tasks to show :)');
          } else {
            this.alertService.error(error);
          }
          this.loading = false;
          // console.log(this.allProjects);
          const ime = this.allStories.find(x => {
            // console.log(x);
            // console.log(this.zgodbaID);
            if(x.id === parseInt(this.zgodbaID)){
              return x;
            }
          });
          this.zgodbaIme = ime.name;
          // console.log("---"+this.zgodbaIme);
      }
    );
  }

  findTask(taskID) {
    let task = null;
    this.allTasks.forEach(t => {
      // console.log(t.id, taskID);
      if(t.id === taskID){
        // console.log(t.id, taskID);
        task = t;
      }
    });
    return task;
  }

  taskDone(i, taskID): void {
    if(this.allTasks[i].userConfirmed === true) {
      if(this.allTasks[i].userWork === false) {
        this.alertService.clear();
        const dialogRef = this.dialog.open(DialogCompletedTaskComponent, {
          width: '50vw',
          // data: {checked: this.name, animal: this.animal}
          // data: {checked: this.allTasks[i].check},
          // data: {checked: this.allTasks[i].isReady}
        });

        dialogRef.afterClosed().subscribe(result => {
          // console.log(result);
          if (result === true) {
            // this.allTasks[i].check = result;
            // console.log(this.allTasks[i].check);
            this.allTasks[i].isReady = result;

            let taskFull = this.findTask(taskID);
            // console.log(taskFull);
            if (taskFull) {
              const task = {
                id: taskFull.id,
                description: taskFull.description,
                timeEstimateHrs: taskFull.timeEstimateHrs,
                idAssignedUser: taskFull.idAssignedUser,
                idSprintStory: taskFull.idSprintStory,
                userConfirmed: taskFull.userConfirmed,
                isReady: true
              };
              this.taskService.updateTask(this.projektID, this.sprintID, this.zgodbaID, taskID, task).pipe(first()) // vrne vse naloge
                .subscribe(
                  data => {
                    // console.log(data);
                    // this.allTasks = data;
                    return data;
                  },
                  error => {
                    this.alertService.error(error);
                    this.loading = false;
                  }
                );
            }
          } else {
            // this.allTasks[i].check = false;
            // console.log(this.allTasks[i].check);
          }
          // console.log('The dialog was closed: '+ result);
        });
      } else {
        this.alertService.clear();
       this.alertService.error('First stop work on task.');
      }
    } else {
       this.alertService.clear();
       this.alertService.error('Cannot mark an unaccepted task as ready');
    }
  }

  taskNotDone(i, taskID) {
    this.alertService.clear();
    // this.allTasks[i].check = false;
    // console.log(this.allTasks[i].check);
    const dialogRef = this.dialog.open(DialogUncompletedTaskComponent, {
      width: '50vw',
      // data: {checked: this.name, animal: this.animal}
      // data: {checked: this.allTasks[i].check}
      // data: {checked: this.allTasks[i].isReady}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === false) {
        // this.allTasks[i].check = result;
        this.allTasks[i].isReady = result;
        // console.log(this.allTasks[i].check);
        let taskFull = this.findTask(taskID);
        // console.log(taskFull);
        if(taskFull) {
          const task = {id: taskFull.id, description: taskFull.description, timeEstimateHrs: taskFull.timeEstimateHrs,
            idAssignedUser: taskFull.idAssignedUser, idSprintStory: taskFull.idSprintStory, userConfirmed: taskFull.userConfirmed,
            isReady: false
          };
          this.taskService.updateTask(this.projektID, this.sprintID, this.zgodbaID, taskID, task).pipe(first()) // vrne vse naloge
            .subscribe(
              data => {
                // console.log(data);
                // this.allTasks = data;
                return data;
              },
              error => {
                this.alertService.error(error);
                this.loading = false;
              }
            );
        }
      } else {
        // this.allTasks[i].check = true;
        // console.log(this.allTasks[i].check);
      }
      // console.log('The dialog was closed: '+ result);
    });
  }

  acceptTask(i, taskID) {
    this.alertService.clear();
    const dialogRef = this.dialog.open(DialogAcceptTaskComponent, {
      width: '50vw',
      data: {userConfirmed: this.allTasks[i].userConfirmed}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.allTasks[i].userConfirmed = result;
        let taskFull = this.findTask(taskID);
        // console.log(taskFull);
        if(taskFull) {
          const task = {id: taskFull.id, description: taskFull.description, timeEstimateHrs: taskFull.timeEstimateHrs,
            idAssignedUser: taskFull.idAssignedUser, idSprintStory: taskFull.idSprintStory,
            userConfirmed: true,
            isReady: taskFull.isReady
          };
          // console.log(task);
          this.taskService.updateTask(this.projektID, this.sprintID, this.zgodbaID, taskID, task).pipe(first()) // vrne vse naloge
            .subscribe(
              data => {
                console.log(data);
                // console.log("----");
                // this.allTasks = data;
                return data;
              },
              error => {
                this.alertService.error(error);
                this.loading = false;
              }
            );
        }
      } else {
        this.allTasks[i].userConfirmed = false;
      }
      // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
      // console.log(this.allTasks);
    });
  }

  giveUpTask(i, taskID) {
    if(this.allTasks[i].isReady === false) {
      this.alertService.clear();
      if(this.allTasks[i].userWork === false) {
        this.alertService.clear();
        const dialogRef = this.dialog.open(DialogGiveupTaskComponent, {
          width: '50vw',
          data: {userConfirmed: this.allTasks[i].userConfirmed}
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result === false) {
            this.allTasks[i].userConfirmed = result;
            this.allTasks[i].idAssignedUser = null;
            this.allTasks[i].user = "";
            let taskFull = this.findTask(taskID);
            // console.log(taskFull);
            if (taskFull) {
              const task = {
                id: taskFull.id, description: taskFull.description, timeEstimateHrs: taskFull.timeEstimateHrs,
                idAssignedUser: null,
                idSprintStory: taskFull.idSprintStory,
                userConfirmed: false,
                isReady: taskFull.isReady
              };
              this.taskService.updateTask(this.projektID, this.sprintID, this.zgodbaID, taskID, task).pipe(first()) // vrne vse naloge
                .subscribe(
                  data => {
                    // console.log(data);
                    // this.allTasks = data;
                    return data;
                  },
                  error => {
                    this.alertService.error(error);
                    this.loading = false;
                  }
                );
            }
          } else {
            this.allTasks[i].userConfirmed = true;
          }
          // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
        });
      } else {
         this.alertService.clear();
         this.alertService.error('First stop work on task.');
      }
    } else {
      this.alertService.error('First uncheck the task.');
    }
  }

  time(i){
    
    //TODO: klici getAllTime :)

    //sortedTime --> ce je vec ur v istem dnevu jih sesteje ter sortira po datumih
    const sortedTime = [];
    let jeZe = false;
    this.allTime.forEach(t => {
      jeZe = false;
      sortedTime.forEach(s=> {
        if(s && s.date) {
          if (t.date === s.date) {
            jeZe = true;
          }
        }
      });
      if(!jeZe) {
        sortedTime.push({date: t.date, hour: 0});
      }
    });
    if(sortedTime.length>0) {
      this.allTime.forEach(t => {
        sortedTime.forEach(s => {
          if (t.date === s.date) {
            s.hour = s.hour + t.hour;
          }
        });
      });
      sortedTime.sort((a, b) => (a.date > b.date) ? 1 : -1);
    }
    // console.log(sortedTime);
    
    this.alertService.clear();
    // this.alertService.warning('Time logging is not yet implemented.');

    const dialogRef = this.dialog.open(DialogTimeComponent, {
        width: '50vw',
        data: {name: this.allTasks[i].description, time: sortedTime, closed: false}
      });

    dialogRef.afterClosed().subscribe(result => {

      // console.log('The dialog was closed: '+ result);
    });

  }

  startWork(i){ // TODO: popravi ko bo v bazi
    // posli datum in uro v bazo
    if(this.allTasks[i].isReady != true) {
      this.alertService.clear();
      this.allTasks[i].userWork = true;
      this.alertService.clear();
      this.alertService.warning('You started working :)');
    } else {
      this.alertService.clear();
      this.alertService.error('First uncheck the task.');
    }

  }

  stopWork(i){ // TODO: popravi ko bo v bazi
    // vzemi datum in uro od zacetka in vrni delovne ure
    this.alertService.clear();
    this.allTasks[i].userWork = false;
    this.alertService.clear();
    this.alertService.warning('You finished working :)');
  }

  redirectTask(i, taskID) {
    this.alertService.clear();
    const dialogRef = this.dialog.open(DialogRedirectTaskComponent, {
      width: '50vw',
      data: {user: this.allTasks[i].user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.allTasks[i].user = this.trenutniUporabnik;
        let taskFull = this.findTask(taskID);
        // console.log(taskFull);
        if(taskFull) {
          const task = {id: taskFull.id, description: taskFull.description, timeEstimateHrs: taskFull.timeEstimateHrs,
            idAssignedUser: this.trenutniUporabnikId,
            idSprintStory: taskFull.idSprintStory, userConfirmed: taskFull.userConfirmed, isReady: taskFull.isReady
          };
          this.taskService.updateTask(this.projektID, this.sprintID, this.zgodbaID, taskID, task).pipe(first()) // vrne vse naloge
            .subscribe(
              data => {
                // console.log(data);
                // this.allTasks = data;
                return data;
              },
              error => {
                this.alertService.error(error);
                this.loading = false;
              }
            );
        }
      }
      // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
    });
  }

  btnAddTask = function() {
    this.alertService.clear();
    this.router.navigateByUrl('/projectDashboard/' + this.projektID + '/sprint/' + this.sprintID + '/story/' + this.zgodbaID + '/addTask');
        // console.log(id);
  };

  backToBacklog() {
    //http://localhost:4200/projectDashboard/1
    this.router.navigateByUrl('/projectDashboard/' + this.projektID);
  }

}


