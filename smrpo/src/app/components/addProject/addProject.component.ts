import { Component, OnInit, Input, NgModule } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { AddProject } from '../../models/AddProject';
// import {first} from 'rxjs/operators';
// import {ActivatedRoute, Router} from '@angular/router';
// import {Http, Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {first} from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import {group} from '@angular/animations';
import {Router} from '@angular/router';
// import { ValidationErrorsComponent } from '../validation-errors/validation-errors.component';
// import { WindowRef } from './WindowRef';
import { AuthenticationService } from  '../../services/authentication.service';



@Component({
  selector: 'app-addProject',
  templateUrl: './addProject.component.html',
  styleUrls: ['./addProject.component.css']
})
export class AddProjectComponent implements OnInit {

  postUrlProject: string = '';
  postUrlUser: string = '';
  loading = false;
  submitted = false;

  public myForm: FormGroup;
  addProjects: AddProject[];
  public projectForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router,
    private authenticationService: AuthenticationService,

  ) {
    this.postUrlProject =  environment.apiUrl + '/project';
    this.postUrlUser =  environment.apiUrl + '/user';
    
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

  getAllUsers() {
    this.http.get<any>(this.postUrlUser).pipe(first()) // vrne vse uporabnike v bazi
    .subscribe(
      data => {
          // console.log(data);
          localStorage.setItem('users', JSON.stringify(''));
          localStorage.setItem('users', JSON.stringify(data));
          return data;
      },
      error => {
          this.alertService.error(error);
          this.loading = false;
      }
    );
  }

  getAllProjects() {
    this.http.get<any>(this.postUrlProject).pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          localStorage.setItem('projects', JSON.stringify(''));
          localStorage.setItem('projects', JSON.stringify(data));
          return data;
      },
      error => {
          localStorage.setItem('projects', JSON.stringify(''));
          // this.alertService.error(error);
          this.loading = false;
      }
    );
  }

  initTeamMembers() {
    return this._fb.group({
      memberName: ['',  Validators.required],
    });
  }

  addMember() {
    const control = this.myForm.controls.teamMembers as FormArray;
    control.push(this.initTeamMembers());
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

    const uporabniki = JSON.parse(localStorage.getItem('users'));
    // console.log(uporabniki);


    const users = this.returnEnteredUsers(uporabniki);
    // console.log('--', users);

    const jePodvajanjeUporabnikov = this.userDuplicates(users); // preverjanje podvajanja clanov v skupini

    // // const vloge = JSON.parse(localStorage.getItem('roles')); // (0: Product owner, 1: Scrum master, 2: Team member)

    const name = this.f.projectName.value;
    const description = this.f.projectDescription.value;
    // console.log(description);



    const projekti = JSON.parse(localStorage.getItem('projects'));
    // console.log(projekti);


    const obstajaZeProjekt = this.projectDuplicates(projekti, name);
    // console.log('ßßß', obstajaZeProjekt);

    const productOwner = this.f.productOwner.value;
    let idProductOwner = '';
    let productOwnerVBazi = false;
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
    let idScrumMaster = '';
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
                    this.http.post<any>(this.postUrlProject, {name, description, idProductOwner, idScrumMaster, users}).pipe(first())
                      .subscribe(
                        data => {
                          console.log(data);
                          // this.router.navigate([this.returnUrl]);
                          // this.router.navigateByUrl('/searchProject');
                          // this.window.scrollTo(0, 0);

                          this.projectForm.reset();
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
