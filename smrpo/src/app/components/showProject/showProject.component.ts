import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import {first} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {AlertService} from '../../services/alert.service';
import _ from 'lodash';
import { ProjectService } from '../../services/project.service';
import {AuthenticationService} from "../../services/authentication.service";



@Component({
  selector: 'app-sjowProject',
  templateUrl: './showProject.component.html',

})
export class ShowProjectComponent implements OnInit {
  loading = false;
  public allProjects;

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService,
    private projectService: ProjectService,
   private authenticationService: AuthenticationService,
  ) {
             // redirect to home if already logged in
     if (this.authenticationService.currentUserValueFromToken.globalRole == 'user') {
      this.router.navigate(['/']);
     }
  }

  ngOnInit(): void {
    this.getAllProjects();
    // console.log(this.allProjects);



  }

  btnEditProject = function(id) {
      this.router.navigateByUrl('/editProject/' + id);
        // console.log(id);
  };

  getAllProjects() {
    // let soProjekti = false;
    this.projectService.getAllProjects().pipe(first()) // vrne vse projekte --> ali projekt ze obstaja
    .subscribe(
      data => {
          // console.log(data);
          // window.location.reload();
          // soProjekti = true;
          // return data;
        this.allProjects = data;
        console.log(this.allProjects);
        if(this.allProjects != '' && this.allProjects != undefined) {
          this.allProjects.sort((a, b) => (a.name > b.name) ? 1 : -1);

        }
      },
      error => {
          if (error === 'Not Found') {
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
