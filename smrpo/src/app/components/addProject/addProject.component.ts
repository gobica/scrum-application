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

  postUrlProject: string = '';
  postUrlRole: string = '';
  postUrlUser: string = '';
  loading = false;
  submitted = false;
  selectedRole;

  public myForm: FormGroup;
  addProjects: AddProject[];
  public projectForm: FormGroup;

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
      ])
    });
    this.projectForm = this._fb.group({
      projectName: ['',  Validators.required],
      projectDescription: ['', ],
      projekt: this.myForm,
    });

    this.getAllUsers();

    this.getAllProjects();

    this.getAllRoles();
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
          // this.alertService.error(error);
          this.loading = false;
      }
    );
  }

  async getAllRoles() {

    await this.http.get<any>(this.postUrlRole).pipe(first()) // vrne vse vloge
    .subscribe(
      data => {
          // console.log(data);
          localStorage.setItem('roles', JSON.stringify(''));
          localStorage.setItem('roles', JSON.stringify(data));
          return data;
      },
      error => {
          localStorage.setItem('roles', JSON.stringify(''));
          // vloge = '';
          if (error === 'Not Found') { // v primeru, da je tabela prazna vnese vrednosti vlog (inicializira)
            this.setAllRoles();
          } else {
            this.alertService.error(error);
          }
          this.loading = false;
      }
    );
  }

  async setAllRoles() {
    // console.log('Nove vloge');
    let name = 'Product owner';
    await this.http.post<any>(this.postUrlRole, {name}).pipe(first())
    .subscribe(
      data => {
        console.log(data);
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      }
    );

    name = 'Scrum master';
    await this.http.post<any>(this.postUrlRole, {name}).pipe(first())
    .subscribe(
      data => {
        console.log(data);
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      }
    );

    name = 'Team member';
    await this.http.post<any>(this.postUrlRole, {name}).pipe(first())
    .subscribe(
      data => {
        console.log(data);
      },
      error => {
        this.alertService.error(error);
        this.loading = false;
      }
    );
    // localStorage.setItem('roles', JSON.stringify(data));
  }

  initTeamMembers() {
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

  returnEnteredUsers(uporabniki) {
    const users = [];
    this.f.projekt.value.teamMembers.forEach(member => { // poisce id uporabnikov na podlagi podanih mailov
      // console.log(member);
      const email = member.memberName;

      if (email !== undefined && email !== '' && email !== null) {

        let idUpo = '';
        uporabniki.forEach(u => {
          if (email === u.email) {
            idUpo = u.id;
            return idUpo;
          }
        });

        if (idUpo !== '') {
          if (member.selectedRole !== '') {
            // { "id": 3, "localRole": "Projektni vodja" }
            users.push({id: idUpo, localRole: member.selectedRole});  // doda uporabnika v array userjev z idjem in vlogo
          } else {
            this.alertService.clear();
            this.alertService.error('Role not selected');
            this.submitted = false;
            this.loading = false;
          }
        } else {
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
    projekti.forEach(p => {
      if (p.name === name) {
        obstajaZeProjekt = true;
      }
    });
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
    // console.log(users);

    const jePodvajanjeUporabnikov = this.userDuplicates(users); // preverjanje podvajanja clanov v skupini



    const vloge = JSON.parse(localStorage.getItem('roles')); // (0: Product owner, 1: Scrum master, 2: Team member)
    // console.log(vloge[0].name);

    let productOwnerNumber = 0;
    users.forEach(v => {
      if (v.localRole === vloge[0].name) { // Product owner
        productOwnerNumber += 1;
      }
    });
    // console.log(productOwnerNumber);

    let scrumMasterNumber = 0;
    users.forEach(v => {
      if (v.localRole === vloge[1].name) { // Scrum master
        scrumMasterNumber += 1;
      }
    });
    // console.log(scrumMasterNumber);




    const name = this.f.projectName.value;
    const description = this.f.projectDescription.value;
    // console.log(description);



    const projekti = JSON.parse(localStorage.getItem('projects'));
    // console.log(projekti);


    const obstajaZeProjekt = this.projectDuplicates(projekti, name);
    // console.log('ßßß', obstajaZeProjekt);



    if (name !== undefined && name !== '' && name !== null) {

      if (obstajaZeProjekt === false) {
        if (users.length === this.f.projekt.value.teamMembers.length) {
          if (jePodvajanjeUporabnikov === false) {
            if (productOwnerNumber === 1) {
              if (scrumMasterNumber === 1) {
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
                if (scrumMasterNumber < 1) {
                  this.alertService.error('Enter a scrum master');
                } else {
                  this.alertService.error('There can be exactly one scrum master');
                }
                this.submitted = false;
                this.loading = false;
              }
            } else {
              if (productOwnerNumber < 1) {
                this.alertService.error('Enter a product owner');
              } else {
                this.alertService.error('There can be exactly one product owner');
              }
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
