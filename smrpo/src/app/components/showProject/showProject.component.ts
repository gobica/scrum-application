import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ShowProject } from '../../models/ShowProject';
import {first} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AlertService} from '../../services/alert.service';
import _ from 'lodash';



@Component({
  selector: 'app-sjowProject',
  templateUrl: './showProject.component.html'
})
export class ShowProjectComponent implements OnInit {
  showProject:ShowProject[];
  postUrlProject: string = '';
  loading = false;
  public projects;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.postUrlProject =  environment.apiUrl + '/project';
  }

  ngOnInit(): void {
    // const soProjekti =
    this.getAllProjects();
    // if (soProjekti === true) {
      this.projects = JSON.parse(localStorage.getItem('projects'));
      if(this.projects != '') {
        this.projects.sort((a, b) => (a.name > b.name) ? 1 : -1);
        // console.log(this.projects);
      }
    // } else {
    //   localStorage.setItem('projects', JSON.stringify(''));
    //   // this.alertService.error('No project yet');
    // }
  }

  btnEditProject = function(id) {
      // localStorage.setItem('projectID', JSON.stringify(''));
      // localStorage.setItem('project', JSON.stringify(''));
      this.router.navigateByUrl('/editProject/' + id);
        // console.log(id);
  };
  btnEnterProject = function(id) {
    this.router.navigateByUrl('/enterProject/' + id);
};

  getAllProjects() {
    // let soProjekti = false;
    this.http.get<any>(this.postUrlProject).pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          localStorage.setItem('projects', JSON.stringify(''));
          localStorage.setItem('projects', JSON.stringify(data));
          // window.location.reload();
          // soProjekti = true;
          // return data;
      },
      error => {
          if (error === 'Not Found') {
            localStorage.setItem('projects', JSON.stringify(''));
            this.alertService.warning('No project to show. Create one :)');

          } else {
            this.alertService.error(error);
          }
          this.loading = false;
      }
    );

    // return soProjekti;
  }



}
