import { Component, OnInit, Input, NgModule } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {first} from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import {group} from '@angular/animations';
import {Router} from '@angular/router';
import { AuthenticationService } from  '../../services/authentication.service';
import { ProjectService } from '../../services/project.service';
import {UserService} from '../../services/user.service';


import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {

  loading = false;
  submitted = false;

  allUsers = [];
  allProjects = [];
  errors = [];


  userNameTeamMember: string[] = [];
  filteredOptionsTeamMember: Observable<string[]>[] = [];

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

  ) {
     // redirect to home if already logged in
     // if (this.authenticationService.currentUserValueFromToken.globalRole === 'user') {
     //  this.router.navigate(['/']);
     // }
    console.log(this.authenticationService.currentUserValueFromToken.globalRole);

  }

  ngOnInit() {
    this.myForm = this._fb.group({
      tasks: this._fb.array([
      this.initTasks(),
      ])
    });
    this.taskForm = this._fb.group({
      task: this.myForm,
    });
    this.getAllUsers();
    this.getAllProjects();
  }

  private _filterTeamMember(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.userNameTeamMember.filter(userNameTeamMember => userNameTeamMember.toLowerCase().indexOf(filterValue) === 0);
  }

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

          let index = 0;
          this.taskForm.value.task.tasks.forEach(t => {
            let ts = this.taskForm.get('task').get('tasks').get([index]).get('memberName');
            // console.log(mN);
            this.filteredOptionsTeamMember[index] = ts.valueChanges.pipe(
              startWith(''),
              map(value => this._filterTeamMember(value))
            );
            index += 1;
          });
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

  initTasks() {
    return this._fb.group({
      taskDescription: ['',  Validators.required],
      taskSize: ['',  Validators.required],
      memberName: ['',  ],
    });
  }

  addTask() {
    const control = this.myForm.controls.tasks as FormArray;
    control.push(this.initTasks());
    let index = 0;
    this.taskForm.value.task.tasks.forEach(m => {
      let mN = this.taskForm.get('task').get('tasks').get([index]).get('memberName');
      // console.log(mN);
      this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
        startWith(''),
        map(value => this._filterTeamMember(value))
      );
      index += 1;
    });
  }

  removeTask(i: number) {
    const control = this.myForm.controls.tasks as FormArray;
    control.removeAt(i);
  }

  get f() {
    return this.taskForm.controls;
  }

  returnEnteredUsers(uporabniki) {
    const users = [];
    this.f.task.value.tasks.forEach(member => { // poisce id uporabnikov na podlagi podanih mailov

      const emailOrUsername = member.memberName;

      if (emailOrUsername !== undefined && emailOrUsername !== '' && emailOrUsername !== null) {

        let idUpo = '';
        uporabniki.forEach(u => {
          if (emailOrUsername === u.email || emailOrUsername === u.username) {
            idUpo = u.id;
            return idUpo;
          }
        });

        if (idUpo !== '') {
          // { "id": 3, "localRole": "Projektni vodja" }
          users.push({id: idUpo});  // doda uporabnika v array userjev z idjem

        } else {
          this.alertService.clear();
          this.alertService.error('The team member is not in the database');
          this.submitted = false;
          this.loading = false;
        }
      } else {

        this.alertService.clear();
        this.alertService.error('Enter a team member or remove it');
        this.submitted = false;
        this.loading = false;
      }
    });
    return users;
  }

  userDuplicates(users) {
    let jePodvajanjeUporabnikov = false;
    users.forEach((u1, index1) => {
       users.forEach((u2, index2) => {
         if (u1.id === u2.id && index1 !== index2) {
           jePodvajanjeUporabnikov = true;
         }
       });
    });
    return jePodvajanjeUporabnikov;
  }

  projectDuplicates(projekti, name) {
    let obstajaZeProjekt = false;
    if (projekti !== '') {
      projekti.forEach(p => {
        if (p.name === name) {
          obstajaZeProjekt = true;
        }
      });
    }
    // console.log(obstajaZeProjekt);
    return obstajaZeProjekt;
  }

  isInDatabase(vsiUporabniki, uporabnik){
    let jeVBazi = false;
    vsiUporabniki.forEach(u => {
      if(u.username === uporabnik) {
        jeVBazi = true;
      }
    });
    return jeVBazi;
  }

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    this.loading = true;

    let dolzina = this.f.task.value.tasks.length;
    const valueOfTasks = this.f.task.value.tasks;
    // console.log(valueOfTasks);
    let taskIndex = 1;
    let correctForm = true;

    valueOfTasks.forEach(task => {
      // console.log(taskIndex);
      // console.log(task);
      if (correctForm === true) {
        const description = task.taskDescription;

        if (description !== undefined && description !== '' && description !== null) {
          // console.log(description);
          this.errors[taskIndex-1] = '';

          const size = task.taskSize;
          if (size !== undefined && size !== '' && size !== null) {
            this.errors[taskIndex-1] = '';
            const correctSize = size % 0.5;
            if (correctSize === 0 && size > 0.4) {
              // console.log(size);
              this.errors[taskIndex-1] = '';
              const user = task.memberName;
              if(user !== undefined && user !== '' && user !== null) {
                const jeVBazi= this.isInDatabase(this.allUsers, user);
                if(jeVBazi === true) {
                   // console.log(user);
                  this.errors[taskIndex-1] = '';


                } else {
                  this.alertService.clear();
                  this.alertService.error('The team member of the ' + taskIndex + '. task is not in the database.');
                  this.errors[taskIndex-1] = 'Not in the database';
                  let tmp = taskIndex;
                  while(tmp < dolzina) {
                    this.errors[tmp] = '';
                    tmp += 1;
                  }
                  this.submitted = false;
                  this.loading = false;
                  correctForm = false;
                }
              }
            } else {
              this.alertService.clear();
              this.alertService.error('The size of the ' + taskIndex + '. task doesn\'t have the right format. Size must be greater than 0.5 and decimal must be 0 or 5.');
              this.errors[taskIndex-1] = 'Wrong format';
              let tmp = taskIndex;
              while(tmp < dolzina) {
                this.errors[tmp] = '';
                tmp += 1;
              }
              this.submitted = false;
              this.loading = false;
              correctForm = false;
            }
          } else {
            this.alertService.clear();
            this.alertService.error('The size of the ' + taskIndex + '. task is blank or has the wrong format. Please complete it correctly or delete the task.');
            this.errors[taskIndex-1] = 'Empty size or wrong format';
            let tmp = taskIndex;
            while(tmp < dolzina) {
              this.errors[tmp] = '';
              tmp += 1;
            }
            this.submitted = false;
            this.loading = false;
            correctForm = false;
          }
        } else {
          this.alertService.clear();
          this.alertService.error('The description of the ' + taskIndex + '. task is blank. Please complete it or delete the task.');
          this.errors[taskIndex-1] = 'Empty description';
          let tmp = taskIndex;
          while(tmp < dolzina) {
            this.errors[tmp] = '';
            tmp += 1;
          }
          this.submitted = false;
          this.loading = false;
          correctForm = false;
        }
         taskIndex += 1;
      } else {
        return false;
      }

    });

    if (correctForm === true) {

      if(dolzina >= 1) {
        console.log(valueOfTasks);
        this.alertService.success('New tasks created');
        // console.log(dolzina);
        let i = 1;

        while (i < dolzina) {
          // console.log(i);
          this.removeTask(1);
          i += 1;
        }

        // console.log(dolzina);

        this.taskForm.get('task').get('tasks').get([0]).get('taskDescription').setValue('');
        this.taskForm.get('task').get('tasks').get([0]).get('taskSize').setValue('');
        this.taskForm.get('task').get('tasks').get([0]).get('memberName').setValue('');
      } else {

        // console.log("manjse enako 1");
        this.alertService.warning('No task to add :(');
      }


    }









    //
    //
    //
    // const uporabniki = this.allUsers;
    // // console.log(uporabniki);
    //
    //
    // const users = this.returnEnteredUsers(uporabniki);
    // // console.log('--', users);
    //
    // const jePodvajanjeUporabnikov = this.userDuplicates(users); // preverjanje podvajanja clanov v skupini
    //
    // const name = this.f.projectName.value;
    // // const description = this.f.projectDescription.value;
    // // console.log(description);
    //
    //
    // const projekti = this.allProjects;
    // // console.log(projekti);
    //
    //
    // const obstajaZeProjekt = this.projectDuplicates(projekti, name);
    // // console.log('ßßß', obstajaZeProjekt);
    //
    // const productOwner = this.f.productOwner.value;
    // // console.log(productOwner);
    // let idProductOwner = 0;
    // let productOwnerVBazi = false;
    // // console.log(uporabniki);
    // uporabniki.forEach(u => {
    //   // console.log(u.username);
    //   // console.log(productOwner);
    //   if (productOwner === u.email || productOwner === u.username) {
    //     productOwnerVBazi = true;
    //     idProductOwner = u.id;
    //     return productOwnerVBazi;
    //   }
    // });
    // const scrumMaster = this.f.scrumMaster.value;
    // let idScrumMaster = 0;
    // let scrumMasterVBazi = false;
    // uporabniki.forEach(u => {
    //   if (scrumMaster === u.email || scrumMaster === u.username) {
    //     scrumMasterVBazi = true;
    //     idScrumMaster = u.id;
    //     return scrumMasterVBazi;
    //   }
    // });
    //
    // if (name !== undefined && name !== '' && name !== null) {
    //   if (obstajaZeProjekt === false) {
    //     if (productOwner !== undefined && productOwner !== '' && productOwner !== null) {
    //       if (productOwnerVBazi) {
    //         if (scrumMaster !== undefined && scrumMaster !== '' && scrumMaster !== null) {
    //           if (scrumMasterVBazi) {
    //             if (users.length === this.f.task.value.tasks.length) {
    //               if (jePodvajanjeUporabnikov === false) {
    //                 const id = 0;
    //                 // const projekt = {id, name, description, idProductOwner, idScrumMaster, users};
    //                 // this.projectService.createProject(projekt).pipe(first())
    //                 //   .subscribe(
    //                 //     data => {
    //                 //       console.log(data);
    //                 //
    //                 //       // window.location.replace('/addProject');
    //                 //
    //                 //       // this.taskForm.reset('');
    //                 //       // console.log(this.taskForm.value.projectName);
    //                 //       this.taskForm.get('projectName').setValue('');
    //                 //       // this.taskForm.get('projectDescription').setValue('');
    //                 //       this.taskForm.get('productOwner').setValue('');
    //                 //       // this.filteredOptionsProductOwner = this.taskForm.get('productOwner').valueChanges.pipe(
    //                 //       //   startWith(''),
    //                 //       //   map(value => this._filterProductOwner(value))
    //                 //       // );
    //                 //       // this.taskForm.get('scrumMaster').setValue('');
    //                 //       // this.filteredOptionsScrumMaster = this.taskForm.get('scrumMaster').valueChanges.pipe(
    //                 //       //   startWith(''),
    //                 //       //   map(value => this._filterScrumMaster(value))
    //                 //       // );
    //                 //       let index = 0;
    //                 //       this.taskForm.value.projekt.tasks.forEach(m => {
    //                 //         this.taskForm.get('projekt').get('tasks').get([index]).get('projectDescription').setValue('');
    //                 //         this.taskForm.get('projekt').get('tasks').get([index]).get('memberName').setValue('');
    //                 //         let mN = this.taskForm.get('projekt').get('tasks').get([index]).get('memberName');
    //                 //         // console.log(mN);
    //                 //         this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
    //                 //           startWith(''),
    //                 //           map(value => this._filterTeamMember(value))
    //                 //         );
    //                 //         index += 1;
    //                 //       });
    //                 //
    //                 //     },
    //                 //     error => {
    //                 //       this.alertService.error(error);
    //                 //       this.loading = false;
    //                 //     });
    //                 this.alertService.success('New project created');
    //               } else {
    //                 this.alertService.error('A team member may not be enrolled twice or more');
    //                 this.submitted = false;
    //                 this.loading = false;
    //               }
    //             } else {
    //               // this.alertService.error('Enter a member email');
    //               this.submitted = false;
    //               this.loading = false;
    //             }
    //           } else {
    //             this.alertService.clear();
    //             this.alertService.error('The scrum master is not in the database');
    //             this.submitted = false;
    //             this.loading = false;
    //           }
    //         } else {
    //           this.alertService.error('Enter a scrum master by username or email');
    //           this.submitted = false;
    //           this.loading = false;
    //         }
    //       } else {
    //         this.alertService.clear();
    //         this.alertService.error('The product owner is not in the database');
    //         this.submitted = false;
    //         this.loading = false;
    //       }
    //     } else {
    //       this.alertService.error('Enter a product owner by username or email');
    //       this.submitted = false;
    //       this.loading = false;
    //     }
    //   } else {
    //       this.alertService.error('A project with this name already exists');
    //       this.submitted = false;
    //       this.loading = false;
    //   }
    // } else {
    //   this.alertService.error('Enter a project name');
    //   this.loading = false;
    // }

    document.body.scrollTop = document.documentElement.scrollTop = 0;

  }



}
