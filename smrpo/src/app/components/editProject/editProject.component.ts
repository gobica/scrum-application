import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { EditProject } from '../../models/EditProject';
import {first} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AlertService} from '../../services/alert.service';
import _ from 'lodash';



@Component({
  selector: 'app-editProject',
  templateUrl: './editProject.component.html',
  styleUrls: ['./editProject.component.css']
})
export class EditProjectComponent implements OnInit {
  editProjects:EditProject[];

  postUrlProjectById: string = '';
  postUrlProject: string = '';
  postUrlUsers: string = '';

  loading = false;
  submitted = false;

  stariUporabniki = [];

  // projekt: {};

  public myForm: FormGroup;
  public projectForm: FormGroup;
  constructor(
    private _fb: FormBuilder,
    // private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private http: HttpClient,
    private alertService: AlertService,
    private router: Router,

  ) {

    this.postUrlProjectById =  environment.apiUrl + '/project/';
    this.postUrlProject =  environment.apiUrl + '/project';
    this.postUrlUsers = '/user/';
  }

  getProjectData(projektID) {
    // localStorage.setItem('project', JSON.stringify(''));

    this.http.get<any>(this.postUrlProjectById + projektID).pipe(first()) // vrne projekt, ki ima dolocen url
    .subscribe(
      data => {
          // console.log(data);

          this.myForm = this._fb.group({

            teamMembers: this._fb.array([

            // this.getTeamMembers(projekt),

            ])
          });
          this.projectForm = this._fb.group({
            projectName: [data.name,  Validators.required],
            projectDescription: [data.description, ],
            productOwner: [data.productOwner.username,  Validators.required],
            scrumMaster: [data.scrumMaster.username,  Validators.required],
            projekt: this.myForm,
          });

          this.setTeamMembers(data);



        // return data;
      },
      error => {
          this.alertService.error(error);
          this.loading = false;
      }
    );


  }

  async ngOnInit() {
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


    let projektID = '';


    this.route.params.subscribe(params => {
        projektID = params.id;
        localStorage.setItem('projektId', JSON.stringify(''));
        localStorage.setItem('projektId', JSON.stringify(projektID));
        // console.log(projektID);
        this.getProjectData(projektID);
    });


    // this.stariUporabniki = JSON.parse(localStorage.getItem('users'));
    // console.log('--', this.stariUporabniki);

  }

  setTeamMembers(projekt) {
    const control = <FormArray>this.myForm.controls['teamMembers'];
    projekt.users.forEach(u => {
      control.push(this.getTeamMembers(u.username));
    });

    this.stariUporabniki = [];
    projekt.users.forEach(u => {
      this.stariUporabniki.push({id: u.id});  // doda uporabnika v array userjev z idjem
    });
    // console.log('Stari:', this.stariUporabniki);

    this.http.get<any>(this.postUrlProject)
    // .toPromise();
    .pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          localStorage.setItem('projects', JSON.stringify(''));
          localStorage.setItem('projects', JSON.stringify(data));
          return data;
      },
      error => {
          if (error === 'Not found') {
            this.alertService.error('No project yet');
          } else {
            this.alertService.error(error);
          }
          this.loading = false;
      });
  }

  getTeamMembers(member) {
    return this._fb.group({
      memberName: [member,  Validators.required],
      // selectedRole: ['',  Validators.required],
    });
  }

  initTeamMembers() {
    return this._fb.group({
      memberName: ['',  Validators.required],
    });
  }

  addMember() {
    const control = <FormArray>this.myForm.controls['teamMembers'];
    control.push(this.initTeamMembers());
  }

  removeMember(i: number) {
    const control = <FormArray>this.myForm.controls['teamMembers'];
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
    const projektID = JSON.parse(localStorage.getItem('projektId'));
    let obstajaZeProjekt = false;
    if (projekti !== '') {
      projekti.forEach(p => {
        if (p.name === name && p.id != projektID) {
          obstajaZeProjekt = true;
        }
      });
    }
    // console.log(obstajaZeProjekt);
    return obstajaZeProjekt;
  }

  async addDeleteUsers(users, projektID) {
    this.stariUporabniki.sort((a, b) => (a.id > b.id) ? 1 : -1);
    // console.log(this.stariUporabniki);
    users.sort((a, b) => (a.id > b.id) ? 1 : -1);
    // console.log(users);


    let staIsta = true;
    let index = 0;
    users.forEach(u => {
      if(!(_.isEqual(u, this.stariUporabniki[index]))) {
        staIsta = false;
      }
      index += 1;
    });

    // je bil zbrisan
    let deleted = [];
    this.stariUporabniki.forEach(u1 => {
      let jeDobljen = users.find(u2 => u2.id === u1.id);
      if(jeDobljen === undefined) {
        deleted.push(u1);
      }
    });
    // console.log('D:', deleted);

    // je bil dodan
    let added = [];
    users.forEach(u1 => {
      let jeDobljen = this.stariUporabniki.find(u2 => u2.id === u1.id);
      if(jeDobljen === undefined) {
        added.push(u1);
      }
    });
    // console.log('A:', added);

    // if(this.stariUporabniki.length === users.length && staIsta === true) {
    //   console.log("Uporabniki niso bili spremenjeni");
    // } else {
    //   console.log("Uporabniki so bili spremenjeni");
    // }
    // console.log('-------------------');


    await added.forEach(async a  => {
      // console.log('A:',a);
      const idProject = projektID;
      const idUser = a.id;
      await this.http.post<any>((this.postUrlProjectById + idProject +  this.postUrlUsers + idUser), {})
      .pipe(first())
      .subscribe(
        data => {
          // console.log("***", data);
          // console.log(users);
        },
        error => {
          // this.alertService.error(error);
          this.loading = false;
        });
      // .toPromise();
      // console.log(nekaj);
    });

    // console.log('HOLAAAA');

    await deleted.forEach(async d => {
      // console.log('D:', d);
      const idProject = projektID;
      const idUser = d.id;
      await this.http.delete<any>((this.postUrlProjectById + idProject + this.postUrlUsers + idUser))
      // .toPromise();
      .pipe(first())
      .subscribe(
        data => {
          // console.log("***", data);
          // console.log(users);
          return data;
        },
        error => {
          // this.alertService.error("Ni slo :(");
          // this.alertService.error(error);
          this.loading = false;
        });
    });
  }

  async onSubmit() {
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
                    const projektID = JSON.parse(localStorage.getItem('projektId'));

                    await this.http.put<any>(this.postUrlProjectById + projektID, {name, description, idProductOwner, idScrumMaster})
                      // .toPromise();
                    .pipe(first())
                    .subscribe(
                      data => {
                        // console.log(data);
                        // console.log(users);
                        this.addDeleteUsers(users, projektID);
                      },
                      error => {
                        this.alertService.error(error);
                        this.loading = false;
                      });


                    // this.router.navigateByUrl('/editProject/' + projektID);
                    await this.alertService.success('Project updated');

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
    const projektID = JSON.parse(localStorage.getItem('projektId'));
    window.location.replace('/editProject/' + projektID);
  }


}

