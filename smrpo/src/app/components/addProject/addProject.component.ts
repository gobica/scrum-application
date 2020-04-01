import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AddProject } from '../../models/AddProject';
import { AddMemberToProject } from '../../models/AddMemberToProject';
// import {first} from 'rxjs/operators';
// import {ActivatedRoute, Router} from '@angular/router';
// import {Http, Response} from '@angular/http';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {first} from 'rxjs/operators';
import { AlertService } from '../../services/alert.service';


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
  postUrl: string = '';
  loading = false;
  submitted = false;

  // loading = false;
  // submitted = false;
  // returnUrl: string;
  // private apiUrl = './api/project';
  // d: any = {};

  // Roles: any = ['Admin', 'Author', 'Reader'];

  // teamRoles: TeamRoles[] = [
  //   {value: 'product-manager-0', viewValue: 'Product manager'},
  //   {value: 'methodology-administrator-1', viewValue: 'Methodology administrator'},
  //   {value: 'team-member-2', viewValue: 'Team member'}
  // ];

  // countMembers: number = 3;

  public myForm: FormGroup;
  constructor(
    private _fb: FormBuilder,
    private http: HttpClient,
    private alertService: AlertService
    // private route: ActivatedRoute,
    // private router: Router,
  ) {
    this.postUrl =  environment.apiUrl + '/project';

  }

  ngOnInit() {
    this.myForm = this._fb.group({
    ProjectName: ['', ],
    teamMembers: this._fb.array([
    this.initTeamMembers(),
    ])
    });
    this.projectForm = this._fb.group({
        projekt: this.myForm,
    });
  }

  initTeamMembers() {
    return this._fb.group({
      MemberName: ['', ],
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
    // console.log('----++++');
    // console.log(this.f.projekt.value);
    // console.log(this.f.projekt.value.teamMembers);

    // reset alerts on submit
    this.alertService.clear();
    this.loading = true;

    const name = this.f.projekt.value.ProjectName;
    const description = 'New project.';
    // const users = ['ime2.priimek2@gmail.com', 'ime.priimek@gmail.com'];

    const a = this.http.post<any>(this.postUrl, { name, description}).pipe(first())
            .subscribe(
                data => {
                    console.log(data);
                    // this.router.navigate([this.returnUrl]);
                },
                error => {
                    this.alertService.error(error);
                    this.loading = false;
                });

    // console.log(a);
    // console.log('----++++');



    // this.d = this.http.get(this.apiUrl).map((res: Response) => res.json());
    // this.d = this.router.navigate([this.apiUrl]);
    // console.log('----++++', this.d);

  //       this.submitted = true;
  //
  //
  //
  //       this.loading = true;
  //
  //       // this.router.navigate('/api/project');
  //
  }

}

@Component({
  selector: 'app-addMemberToProject',
  templateUrl: './addMemberToProject.component.html'
})
export class AddMemberToProjectComponent implements OnInit {
  addMemberToProject: AddMemberToProject[];
  constructor() { }

  ngOnInit(): void {

  }


}
