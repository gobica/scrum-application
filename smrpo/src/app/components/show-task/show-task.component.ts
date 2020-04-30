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
  public zgodbaIme;

  trenutniUporabnik = this.authenticationService.currentUserValueFromToken.username;

  loading = false;
  submitted = false;

  allUsers = [];
  allProjects = [];
  allStories = [];
  errors = [];
  // allTasks = [{check: false, description: 'Prva naloga je lepa', size: 2.5, user: 'roberto'}, {check: false, description: 'Druga naloga je zanimiva', size: 3.0, user: ''}, {check: false, description: 'Tretja naloga je dolgočasna', size: 4.5, user: 'samantha'}];
  allTasks = [];


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

          const users = [];
          data.forEach(u => {
            users.push(u.username);
          });
          this.userNameTeamMember = users;

          // let index = 0;
          // this.taskForm.value.task.tasks.forEach(t => {
          //   let ts = this.taskForm.get('task').get('tasks').get([index]).get('memberName');
          //   // console.log(mN);
          //   // this.filteredOptionsTeamMember[index] = ts.valueChanges.pipe(
          //   //   startWith(''),
          //   //   map(value => this._filterTeamMember(value))
          //   // );
          //   index += 1;
          // });
          // console.log(index);
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
              if(u.id === t.idAssignedUser){
                t.user = u.username; // doda novo polje v task! POZOR!
              }
            });
            // console.log(t);
            t.check = false; // TODO: zbriši, ko bo check implementiran!
          });
          // console.log(this.allProjects);
          this.zgodbaIme = this.allStories.find(x => {
            // console.log(x);
            // console.log(this.zgodbaID);
            if(x.id === parseInt(this.zgodbaID)){
              return x;
            }
          });
          this.zgodbaIme = this.zgodbaIme.name;
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
          this.zgodbaIme = this.allStories.find(x => {
            // console.log(x);
            // console.log(this.zgodbaID);
            if(x.id === parseInt(this.zgodbaID)){
              return x;
            }
          });
          this.zgodbaIme = this.zgodbaIme.name;
          // console.log("---"+this.zgodbaIme);
      }
    );
  }

  // initTasks() {
  //   return this._fb.group({
  //     taskDescription: ['',  Validators.required],
  //     taskSize: ['',  Validators.required],
  //     memberName: ['',  ],
  //   });
  // }
  //
  // addTask() {
  //   const control = this.myForm.controls.tasks as FormArray;
  //   control.push(this.initTasks());
  //   let index = 0;
  //   this.taskForm.value.task.tasks.forEach(m => {
  //     let mN = this.taskForm.get('task').get('tasks').get([index]).get('memberName');
  //     // console.log(mN);
  //     // this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
  //     //   startWith(''),
  //     //   map(value => this._filterTeamMember(value))
  //     // );
  //     index += 1;
  //   });
  // }
  //
  // removeTask(i: number) {
  //   const control = this.myForm.controls.tasks as FormArray;
  //   control.removeAt(i);
  // }
  //
  // get f() {
  //   return this.taskForm.controls;
  // }
  //
  // isInDatabase(vsiUporabniki, uporabnik){
  //   let jeVBazi = false;
  //   vsiUporabniki.forEach(u => {
  //     if(u.username === uporabnik) {
  //       jeVBazi = true;
  //     }
  //   });
  //   return jeVBazi;
  // }
  //
  // onSubmit() {
  //   this.submitted = true;
  //   // reset alerts on submit
  //   this.alertService.clear();
  //   this.loading = true;
  //
  //   let dolzina = this.f.task.value.tasks.length;
  //   const valueOfTasks = this.f.task.value.tasks;
  //   // console.log(valueOfTasks);
  //   let taskIndex = 1;
  //   let correctForm = true;
  //
  //   valueOfTasks.forEach(task => {
  //     // console.log(taskIndex);
  //     // console.log(task);
  //     if (correctForm === true) {
  //       const description = task.taskDescription;
  //
  //       if (description !== undefined && description !== '' && description !== null) {
  //         // console.log(description);
  //         this.errors[taskIndex-1] = '';
  //
  //         const size = task.taskSize;
  //         if (size !== undefined && size !== '' && size !== null) {
  //           this.errors[taskIndex-1] = '';
  //           const correctSize = size % 0.5;
  //           if (correctSize === 0 && size > 0.4) {
  //             // console.log(size);
  //             this.errors[taskIndex-1] = '';
  //             const user = task.memberName;
  //             if(user !== undefined && user !== '' && user !== null) {
  //               const jeVBazi= this.isInDatabase(this.allUsers, user);
  //               if(jeVBazi === true) {
  //                  // console.log(user);
  //                 this.errors[taskIndex-1] = '';
  //
  //
  //               } else {
  //                 this.alertService.clear();
  //                 this.alertService.error('The team member of the ' + taskIndex + '. task is not in the database.');
  //                 this.errors[taskIndex-1] = 'Not in the database';
  //                 let tmp = taskIndex;
  //                 while(tmp < dolzina) {
  //                   this.errors[tmp] = '';
  //                   tmp += 1;
  //                 }
  //                 this.submitted = false;
  //                 this.loading = false;
  //                 correctForm = false;
  //               }
  //             }
  //           } else {
  //             this.alertService.clear();
  //             this.alertService.error('The size of the ' + taskIndex + '. task doesn\'t have the right format. Size must be greater than 0.5 and decimal must be 0 or 5.');
  //             this.errors[taskIndex-1] = 'Wrong format';
  //             let tmp = taskIndex;
  //             while(tmp < dolzina) {
  //               this.errors[tmp] = '';
  //               tmp += 1;
  //             }
  //             this.submitted = false;
  //             this.loading = false;
  //             correctForm = false;
  //           }
  //         } else {
  //           this.alertService.clear();
  //           this.alertService.error('The size of the ' + taskIndex + '. task is blank or has the wrong format. Please complete it correctly or delete the task.');
  //           this.errors[taskIndex-1] = 'Empty size or wrong format';
  //           let tmp = taskIndex;
  //           while(tmp < dolzina) {
  //             this.errors[tmp] = '';
  //             tmp += 1;
  //           }
  //           this.submitted = false;
  //           this.loading = false;
  //           correctForm = false;
  //         }
  //       } else {
  //         this.alertService.clear();
  //         this.alertService.error('The description of the ' + taskIndex + '. task is blank. Please complete it or delete the task.');
  //         this.errors[taskIndex-1] = 'Empty description';
  //         let tmp = taskIndex;
  //         while(tmp < dolzina) {
  //           this.errors[tmp] = '';
  //           tmp += 1;
  //         }
  //         this.submitted = false;
  //         this.loading = false;
  //         correctForm = false;
  //       }
  //        taskIndex += 1;
  //     } else {
  //       return false;
  //     }
  //
  //   });
  //
  //   if (correctForm === true) {
  //
  //     if(dolzina >= 1) {
  //       console.log(valueOfTasks);
  //       this.alertService.success('New tasks created');
  //       // console.log(dolzina);
  //       let i = 1;
  //
  //       while (i < dolzina) {
  //         // console.log(i);
  //         this.removeTask(1);
  //         i += 1;
  //       }
  //
  //       // console.log(dolzina);
  //
  //       this.taskForm.get('task').get('tasks').get([0]).get('taskDescription').setValue('');
  //       this.taskForm.get('task').get('tasks').get([0]).get('taskSize').setValue('');
  //       this.taskForm.get('task').get('tasks').get([0]).get('memberName').setValue('');
  //     } else {
  //
  //       // console.log("manjse enako 1");
  //       this.alertService.warning('No task to add :(');
  //     }
  //
  //
  //   }
  //
  //
  //   document.body.scrollTop = document.documentElement.scrollTop = 0;
  //
  // }

  taskDone(i): void {
    if(this.allTasks[i].userConfirmed === true) {
      const dialogRef = this.dialog.open(DialogCompletedTaskComponent, {
        width: '50vw',
        // data: {checked: this.name, animal: this.animal}
        data: {checked: this.allTasks[i].check}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.allTasks[i].check = result;
          // console.log(this.allTasks[i].check);
        } else {
          this.allTasks[i].check = false;
          // console.log(this.allTasks[i].check);
        }
        // console.log('The dialog was closed: '+ result);
      });
    } else {
       this.alertService.clear();
       this.alertService.error('Task is not already accepted.');
    }
  }

  taskNotDone(i) {
    this.alertService.clear();
    // this.allTasks[i].check = false;
    // console.log(this.allTasks[i].check);
    const dialogRef = this.dialog.open(DialogUncompletedTaskComponent, {
      width: '50vw',
      // data: {checked: this.name, animal: this.animal}
      data: {checked: this.allTasks[i].check}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === false) {
        this.allTasks[i].check = result;
        // console.log(this.allTasks[i].check);
      } else {
        this.allTasks[i].check = true;
        // console.log(this.allTasks[i].check);
      }
      // console.log('The dialog was closed: '+ result);
    });
  }

  acceptTask(i) {
    this.alertService.clear();
    const dialogRef = this.dialog.open(DialogAcceptTaskComponent, {
      width: '50vw',
      data: {userConfirmed: this.allTasks[i].userConfirmed}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.allTasks[i].userConfirmed = result;
      } else {
        this.allTasks[i].userConfirmed = false;
      }
      // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
    });
  }

  giveUpTask(i) {
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
      } else {
        this.allTasks[i].userConfirmed = true;
      }
      // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
    });
  }

  redirectTask(i) {
    this.alertService.clear();
    const dialogRef = this.dialog.open(DialogRedirectTaskComponent, {
      width: '50vw',
      data: {user: this.allTasks[i].user}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.allTasks[i].user = this.trenutniUporabnik;
      }
      // console.log('The dialog was closed: '+ this.allTasks[i].userConfirmed);
    });
  }

  btnAddTask = function() {
    this.alertService.clear();
    this.router.navigateByUrl('/projectDashboard/' + this.projektID + '/sprint/' + this.sprintID + '/story/' + this.zgodbaID + '/addTask');
        // console.log(id);
  };
}


