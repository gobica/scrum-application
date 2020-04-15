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
// import { Pipe, PipeTransform } from '@angular/core';

import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


// @Pipe({
//   name: 'stringFilterBy'
// })
//
// export class StringFilterByPipe implements PipeTransform {
//
//   transform(arr: any[], searchText: string,fieldName?:string): any[] {
//     if (!arr) return [];
//     if (!searchText) return arr;
//     searchText = searchText.toLowerCase();
//     return arr.filter((it:any) => {
//       if(typeof it == 'string'){
//         return it.toLowerCase().includes(searchText);
//       }else if(typeof it == 'number'){
//         return it.toString().toLowerCase().includes(searchText);
//       }else{
//         return it[fieldName].toLowerCase().includes(searchText);
//       }
//
//     });
//   }
//
// }


@Component({
  selector: 'app-addProject',
  templateUrl: './addProject.component.html',
  styleUrls: ['./addProject.component.css']
})
export class AddProjectComponent implements OnInit {

  loading = false;
  submitted = false;

  allUsers = [];
  allProjects = [];

  userNameProductOwner: string[] = [];
  filteredOptionsProductOwner: Observable<string[]>;
  userNameScrumMaster: string[] = [];
  filteredOptionsScrumMaster: Observable<string[]>;
  userNameTeamMember: string[] = [];
  filteredOptionsTeamMember: Observable<string[]>[] = [];

  public myForm: FormGroup;
  public projectForm: FormGroup;

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
     if (this.authenticationService.currentUserValueFromToken.globalRole == 'user') {
      this.router.navigate(['/']);
     }

  }

  ngOnInit() {
    this.myForm = this._fb.group({

      teamMembers: this._fb.array([
      this.initTeamMembers(),
      ])
    });
    this.projectForm = this._fb.group({
      projectName: ['',  Validators.required],
      projectDescription: ['', ],
      productOwner: ['',  Validators.required],
      scrumMaster: ['',  Validators.required],
      projekt: this.myForm,
    });
    this.getAllUsers();
    this.getAllProjects();
  }

  private _filterProductOwner(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.userNameProductOwner.filter(userNameProductOwner => userNameProductOwner.toLowerCase().indexOf(filterValue) === 0);
  }
  private _filterScrumMaster(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.userNameScrumMaster.filter(userNameScrumMaster => userNameScrumMaster.toLowerCase().indexOf(filterValue) === 0);
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
            // this.userNameProductOwner.push(u.username);
            // this.userNameScrumMaster.push(u.username);

            // console.log(u.username);
          });
          this.userNameProductOwner = users;
          this.userNameScrumMaster = users;
          this.userNameTeamMember = users;

          // console.log(this.userNameProductOwner);
          // console.log(this.userNameScrumMaster);

          this.filteredOptionsProductOwner = this.projectForm.get('productOwner').valueChanges.pipe(
            startWith(''),
            map(value => this._filterProductOwner(value))
          );
          this.filteredOptionsScrumMaster = this.projectForm.get('scrumMaster').valueChanges.pipe(
            startWith(''),
            map(value => this._filterScrumMaster(value))
          );

          // console.log(this.projectForm.value.projekt.teamMembers);
          let index = 0;
          this.projectForm.value.projekt.teamMembers.forEach(m => {
            let mN = this.projectForm.get('projekt').get('teamMembers').get([index]).get('memberName');
            // console.log(mN);
            this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
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

  initTeamMembers() {
    return this._fb.group({
      memberName: ['',  Validators.required],
    });
  }

  addMember() {
    const control = this.myForm.controls.teamMembers as FormArray;
    control.push(this.initTeamMembers());
    let index = 0;
    this.projectForm.value.projekt.teamMembers.forEach(m => {
      let mN = this.projectForm.get('projekt').get('teamMembers').get([index]).get('memberName');
      // console.log(mN);
      this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
        startWith(''),
        map(value => this._filterTeamMember(value))
      );
      index += 1;
    });
  }

  removeMember(i: number) {
    const control = this.myForm.controls.teamMembers as FormArray;
    control.removeAt(i);
  }

  get f() {
    return this.projectForm.controls;
  }

  returnEnteredUsers(uporabniki) {
    const users = [];
    this.f.projekt.value.teamMembers.forEach(member => { // poisce id uporabnikov na podlagi podanih mailov

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

  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    this.loading = true;


    const uporabniki = this.allUsers;
    // console.log(uporabniki);


    const users = this.returnEnteredUsers(uporabniki);
    // console.log('--', users);

    const jePodvajanjeUporabnikov = this.userDuplicates(users); // preverjanje podvajanja clanov v skupini

    const name = this.f.projectName.value;
    const description = this.f.projectDescription.value;
    // console.log(description);


    const projekti = this.allProjects;
    // console.log(projekti);


    const obstajaZeProjekt = this.projectDuplicates(projekti, name);
    // console.log('ßßß', obstajaZeProjekt);

    const productOwner = this.f.productOwner.value;
    // console.log(productOwner);
    let idProductOwner = 0;
    let productOwnerVBazi = false;
    // console.log(uporabniki);
    uporabniki.forEach(u => {
      // console.log(u.username);
      // console.log(productOwner);
      if (productOwner === u.email || productOwner === u.username) {
        productOwnerVBazi = true;
        idProductOwner = u.id;
        return productOwnerVBazi;
      }
    });
    const scrumMaster = this.f.scrumMaster.value;
    let idScrumMaster = 0;
    let scrumMasterVBazi = false;
    uporabniki.forEach(u => {
      if (scrumMaster === u.email || scrumMaster === u.username) {
        scrumMasterVBazi = true;
        idScrumMaster = u.id;
        return scrumMasterVBazi;
      }
    });

    if (name !== undefined && name !== '' && name !== null) {
      if (obstajaZeProjekt === false) {
        if (productOwner !== undefined && productOwner !== '' && productOwner !== null) {
          if (productOwnerVBazi) {
            if (scrumMaster !== undefined && scrumMaster !== '' && scrumMaster !== null) {
              if (scrumMasterVBazi) {
                if (users.length === this.f.projekt.value.teamMembers.length) {
                  if (jePodvajanjeUporabnikov === false) {
                    const id = 0;
                    const projekt = {id, name, description, idProductOwner, idScrumMaster, users};
                    this.projectService.createProject(projekt).pipe(first())
                      .subscribe(
                        data => {
                          console.log(data);

                          // window.location.replace('/addProject');

                          // this.projectForm.reset('');
                          // console.log(this.projectForm.value.projectName);
                          this.projectForm.get('projectName').setValue('');
                          this.projectForm.get('projectDescription').setValue('');
                          this.projectForm.get('productOwner').setValue('');
                          this.filteredOptionsProductOwner = this.projectForm.get('productOwner').valueChanges.pipe(
                            startWith(''),
                            map(value => this._filterProductOwner(value))
                          );
                          this.projectForm.get('scrumMaster').setValue('');
                          this.filteredOptionsScrumMaster = this.projectForm.get('scrumMaster').valueChanges.pipe(
                            startWith(''),
                            map(value => this._filterScrumMaster(value))
                          );
                          let index = 0;
                          this.projectForm.value.projekt.teamMembers.forEach(m => {
                            this.projectForm.get('projekt').get('teamMembers').get([index]).get('memberName').setValue('');
                            let mN = this.projectForm.get('projekt').get('teamMembers').get([index]).get('memberName');
                            // console.log(mN);
                            this.filteredOptionsTeamMember[index] = mN.valueChanges.pipe(
                              startWith(''),
                              map(value => this._filterTeamMember(value))
                            );
                            index += 1;
                          });

                        },
                        error => {
                          this.alertService.error(error);
                          this.loading = false;
                        });
                    this.alertService.success('New project created');
                  } else {
                    this.alertService.error('A team member may not be enrolled twice or more');
                    this.submitted = false;
                    this.loading = false;
                  }
                } else {
                  // this.alertService.error('Enter a member email');
                  this.submitted = false;
                  this.loading = false;
                }
              } else {
                this.alertService.clear();
                this.alertService.error('The scrum master is not in the database');
                this.submitted = false;
                this.loading = false;
              }
            } else {
              this.alertService.error('Enter a scrum master by username or email');
              this.submitted = false;
              this.loading = false;
            }
          } else {
            this.alertService.clear();
            this.alertService.error('The product owner is not in the database');
            this.submitted = false;
            this.loading = false;
          }
        } else {
          this.alertService.error('Enter a product owner by username or email');
          this.submitted = false;
          this.loading = false;
        }
      } else {
          this.alertService.error('A project with this name already exists');
          this.submitted = false;
          this.loading = false;
      }
    } else {
      this.alertService.error('Enter a project name');
      this.loading = false;
    }

    document.body.scrollTop = document.documentElement.scrollTop = 0;

  }

}
