import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { EditProject } from '../../models/EditProject';
import { SearchProject } from '../../models/SearchProject';



// interface TeamRoles {
//   value: string;
//   viewValue: string;
// }

@Component({
  selector: 'app-editProject',
  templateUrl: './editProject.component.html',
  styleUrls: ['./editProject.component.css']
})
export class EditProjectComponent implements OnInit {
  editProjects:EditProject[];

  public myForm: FormGroup;
  public projectForm: FormGroup;
  constructor(private _fb: FormBuilder) { }

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
    return this._fb.group({
      memberName: ['',  Validators.required],
      selectedRole: ['',  Validators.required],
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


}

@Component({
  selector: 'app-searchProject',
  templateUrl: './searchProject.component.html'
})
export class SearchProjectComponent implements OnInit {
  searchProject:SearchProject[];
  constructor(private router: Router) { }

  ngOnInit(): void {

  }

  btnSearch= function () {
        this.router.navigateByUrl('/editProject');
  }

}
