import { Component, OnInit, Input, NgModule } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
import { AddProject } from '../../models/AddProject';
import { AddMemberToProject } from '../../models/AddMemberToProject';
// import {first} from 'rxjs/operators';
// import {ActivatedRoute, Router} from '@angular/router';
// import {Http, Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {first} from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';
import {group} from '@angular/animations';
// import { ValidationErrorsComponent } from '../validation-errors/validation-errors.component';


// interface TeamRoles {
//   value: string;
//   viewValue: string;
// }



@Component({
  selector: 'app-addProject',
  templateUrl: './addProject.component.html',
  styleUrls: ['./addProject.component.css']
})
export class AddProjectComponent implements OnInit {
  addProjects: AddProject[];
  public projectForm: FormGroup;
  postUrlProject: string = '';
  postUrlRole: string = '';
  postUrlUser: string = '';
  loading = false;
  submitted = false;
  selectedRole;
  // error: ValidationErrorsComponent;

  // public group: FormGroup;
  // public member_form : group;

  public myForm: FormGroup;
  // public member: FormGroup;
  constructor(
    private _fb: FormBuilder,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.postUrlProject =  environment.apiUrl + '/project';
    this.postUrlRole =  environment.apiUrl + '/project/role';
    this.postUrlUser =  environment.apiUrl + '/user';

  }

  ngOnInit() {
    this.myForm = this._fb.group({

      teamMembers: this._fb.array([
      this.initTeamMembers(),
      //   this.member = this._fb.group({
      //     memberName: ['',  Validators.required],
      //     selectedRole: ['',  Validators.required],
      //   }),
      ])
    });
    this.projectForm = this._fb.group({
        projectName: ['',  Validators.required],
        projekt: this.myForm,
    });
  }

  initTeamMembers() {
    // this.group = this._fb.group({
    //   memberName: ['', ],
    //   selectedRole: ['', ],
    // });
    // return this.group;

    return this._fb.group({
      memberName: ['',  Validators.required],
      selectedRole: ['',  Validators.required],
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
  onSubmit() {
    this.submitted = true;
    // reset alerts on submit
    this.alertService.clear();
    this.loading = true;

    // console.log('----++++');
    // console.log(this.f.projekt.value);
    // console.log(this.f.projekt.value.teamMembers);
    //

    this.http.get<any>(this.postUrlUser).pipe(first()) // vrne vse uporabnike v bazi
      .subscribe(
          data => {
              // console.log(data);
              // this.router.navigate([this.returnUrl]);
              localStorage.setItem('users', JSON.stringify(data));
              return data;
          },
          error => {
              this.alertService.error(error);
              this.loading = false;
          });
    const uporabniki = JSON.parse(localStorage.getItem('users'));

    // console.log(uporabniki);

    const users = [];

    this.f.projekt.value.teamMembers.forEach(member => { // poisce id uporabnikov na podlagi podanih mailov
      // console.log(member);
      const email = member.memberName;

      if (email !== undefined && email !== '' && email !== null) {

        let idUpo = '';
        const idUporabnika = uporabniki.forEach(u => {
          if (email === u.email) {
            idUpo = u.id;
            return idUpo;
          }
        });

        if (idUpo !== '') {
          // console.log('ID2: ', idUpo);
          // { "id": 3, "localRole": "Projektni vodja" }
          if (member.selectedRole !== '') {
            users.push({id: idUpo, localRole: member.selectedRole});  // doda uporabnika v array userjev z idjem in ulogo
          } else {
            this.alertService.clear();
            this.alertService.error('Role not selected');
            this.submitted = false;
            this.loading = false;
          }
        } else {
          // console.log('Uporabnik je prazen...');
          this.alertService.clear();
          this.alertService.error('The team member is not in the database');
          this.submitted = false;
          this.loading = false;
        }
      } else {
        this.alertService.clear();
        this.alertService.error('Enter the team member email');
        this.submitted = false;
        this.loading = false;
      }
    });

    // console.log(users);


    // preverjanje podvajanja clanov v skupini
    let jePodvajanjeUporabnikov = false;
    users.forEach((u1, index1) => {
       users.forEach((u2, index2) => {
         if (u1.id === u2.id && index1 !== index2) {
           jePodvajanjeUporabnikov = true;
         }
       });
    });


    let soVseVloge = true;
    const soVloge = [0, 0, 0];
    const roles = ['product-manager-0', 'methodology-administrator-1', 'team-member-2'];

    users.forEach(v => {
      if (v.localRole === roles[0]) {
        soVloge[0] += 1;
      }
      if (v.localRole === roles[1]) {
        soVloge[1] += 1;
      }
      if (v.localRole === roles[2]) {
        soVloge[2] += 1;
      }
    });
    soVloge.forEach( v => {
      if (v === 0) {
        soVseVloge = false;
      }
    });


    const name = this.f.projectName.value;
    const description = 'New project.';


    this.http.get<any>(this.postUrlProject).pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
      .subscribe(
          data => {
              // console.log(data);
              // this.router.navigate([this.returnUrl]);
              localStorage.setItem('projects', JSON.stringify(data));
              return data;
          },
          error => {
              this.alertService.error(error);
              this.loading = false;
          });
    const projekti = JSON.parse(localStorage.getItem('projects'));
    // console.log(projekti);


    let obstajaZeProjekt = false;
    projekti.forEach(p => {
      if (p.name === name) {
        obstajaZeProjekt = true;
      }
    });
    // console.log('ßßß', obstajaZeProjekt);



    // console.log(name);

    // console.log(users.length, this.f.projekt.value.teamMembers.length);
    if (name !== undefined && name !== '' && name !== null) {

      if (obstajaZeProjekt === false) {
        if (users.length === this.f.projekt.value.teamMembers.length) {
          if (jePodvajanjeUporabnikov === false) {
            if (soVseVloge === true) {

              this.http.post<any>(this.postUrlProject, {name, description, users}).pipe(first())
                .subscribe(
                  data => {
                    console.log(data);
                    // this.router.navigate([this.returnUrl]);
                  },
                  error => {
                    this.alertService.error(error);
                    this.loading = false;
                  });
              this.alertService.success('New project created');
            } else {
              this.alertService.error('Project must have product owner, methodology master and team member');
              this.submitted = false;
              this.loading = false;
            }
          } else {
            this.alertService.error('A member may not be enrolled twice or more');
            this.submitted = false;
            this.loading = false;
          }
        } else {
          // this.alertService.error('Enter a correct team member email!');
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
    // console.log(a);
    // console.log('----++++');




  }

}

// @NgModule({
//    imports: [ValidationErrorsComponent],
//
// })

@Component({
  selector: 'app-addMemberToProject',
  templateUrl: './addMemberToProject.component.html'
})
export class AddMemberToProjectComponent implements OnInit {
  addMemberToProject: AddMemberToProject[];
  // public myForm: FormGroup;
  public group: FormGroup;
  // public member_form : group;
  constructor() { }
  memberName;
  selectedRole;
  ngOnInit(): void {

  }


}
