import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import {first, map, startWith} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AlertService} from '../../services/alert.service';
import { AuthenticationService } from  '../../services/authentication.service';
import _ from 'lodash';
import { ProjectService } from '../../services/project.service';
import {UserService} from '../../services/user.service';
import {Observable} from "rxjs";



@Component({
  selector: 'app-editProject',
  templateUrl: './editProject.component.html',
  styleUrls: ['./editProject.component.css']
})
export class EditProjectComponent implements OnInit {
  public projektID;

  loading = false;
  submitted = false;

  allUsers = [];
  allProjects = [];
  stariUporabniki = [];

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
    private route: ActivatedRoute,
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

  getProjectData(projektID) {

    this.projectService.getProject(projektID).pipe(first()) // vrne projekt, ki ima dolocen url
    .subscribe(
      data => {
          // console.log(data['name']);

          this.myForm = this._fb.group({

            teamMembers: this._fb.array([

            // this.getTeamMembers(projekt),

            ])
          });
          this.projectForm = this._fb.group({
            projectName: [data['name'],  Validators.required],
            projectDescription: [data['description'], ],
            productOwner: [data['productOwner'].username,  Validators.required],
            scrumMaster: [data['scrumMaster'].username,  Validators.required],
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


    // let projektID = '';


    this.route.params.subscribe(params => {
        this.projektID = params.id;
        // console.log(projektID);
        this.getProjectData(this.projektID);
    });

    // console.log('--', this.stariUporabniki);

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
    this.userService.getAll().pipe(first()) // vrne vse uporabnike v bazi
    .subscribe(
      data => {
          // console.log(data);

          this.allUsers = data;
          // console.log(this.allUsers);


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
  }

  getAllProjects() {
    this.projectService.getAllProjects().pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          this.allProjects = data;
          return data;
      },
      error => {
          if (error === 'Not found') {
            this.alertService.error('No project yet');
          } else {
            this.alertService.error(error);
          }
          this.loading = false;
      }
    );
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
    let obstajaZeProjekt = false;
    if (projekti !== '') {
      projekti.forEach(p => {
        if (p.name === name && p.id != this.projektID) {
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
      await this.projectService.addUserToProject(idProject, idUser)
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
      await this.projectService.deleteUserFromProject(idProject, idUser)
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

    const uporabniki = this.allUsers;
    // console.log(uporabniki);


    const users = this.returnEnteredUsers(uporabniki);
    // console.log('--', users);

    const jePodvajanjeUporabnikov = this.userDuplicates(users); // preverjanje podvajanja clanov v skupini

    // // const vloge // (0: Product owner, 1: Scrum master, 2: Team member)

    const name = this.f.projectName.value;
    const description = this.f.projectDescription.value;
    // console.log(description);


    const projekti = this.allProjects;
    // console.log(projekti);


    const obstajaZeProjekt = this.projectDuplicates(projekti, name);
    // console.log('ßßß', obstajaZeProjekt);

    const productOwner = this.f.productOwner.value;
    let idProductOwner = 0;
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
                    const id = this.projektID;
                    const projekt = {id, name, description, idProductOwner, idScrumMaster, users};
                    await this.projectService.updateProject(projekt)
                      // .toPromise();
                    .pipe(first())
                    .subscribe(
                      data => {
                        // console.log(data);
                        // console.log(users);
                        this.addDeleteUsers(users, id);
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
    // const projektID = JSON.parse(localStorage.getItem('projektId'));
    // window.location.replace('/editProject/' + projektID);
  }


}

