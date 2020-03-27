import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AddProject } from '../../models/AddProject';
import { AddMemberToProject } from '../../models/AddMemberToProject';


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
  addProjects:AddProject[];
  // Roles: any = ['Admin', 'Author', 'Reader'];

  // teamRoles: TeamRoles[] = [
  //   {value: 'product-manager-0', viewValue: 'Product manager'},
  //   {value: 'methodology-administrator-1', viewValue: 'Methodology administrator'},
  //   {value: 'team-member-2', viewValue: 'Team member'}
  // ];

  countMembers: number = 3;

  public myForm: FormGroup;
  constructor(private _fb: FormBuilder) { }

  ngOnInit() {
    this.myForm = this._fb.group({
    FrontEnd: ['',],
    teamMembers: this._fb.array([
    this.initTeamMembers(),
    ])
    });
  }

  initTeamMembers() {
    return this._fb.group({
    });
  }

  addMember() {
    const control = <FormArray>this.myForm.controls['teamMembers'];
    // console.log("Click:", control);
    // console.log(this.myForm.controls.teamMembers['controls']);
    control.push(this.initTeamMembers());
    // this.countMembers++
    // console.log("Click:", this.countMembers);
  }

  removeMember(i: number) {
    const control = <FormArray>this.myForm.controls['teamMembers'];
    control.removeAt(i);
  }

}

@Component({
  selector: 'app-addMemberToProject',
  templateUrl: './addMemberToProject.component.html'
})
export class AddMemberToProjectComponent implements OnInit {
  addMemberToProject:AddMemberToProject[];
  constructor() { }

  ngOnInit(): void {

  }


}


// @Component({
//   selector: 'app-toolbar',
//   template: '<button (click)="addComponentClick.emit()">Add Text component</button>'
// })
// export class ToolbarComponent {
//   @Output() addComponentClick = new EventEmitter();
//    constructor() { }
// }
//
// @Component({
//    selector: 'app-view',
//    template: `<div class="container">
// <app-toolbar (addComponentClick)="onAddComponentClick()"></app-toolbar>
// <div app-type="section" id="SECTION1" [active]="true"></div>
// <div app-type="section" id="SECTION2"></div>
// </div>`
// })
// export class ViewComponent implements AfterViewInit, OnInit {
//   @ViewChildren(SectionComponent) sections: QueryList<SectionComponent>;
//   activeSections: SectionComponent[];
//   textComponentFactory: ComponentFactory<TextComponent>;
//
//   constructor(private componentFactoryResolver: ComponentFactoryResolver) {  }
//
//   ngOnInit() {
//     this.textComponentFactory = this.componentFactoryResolver.resolveComponentFactory(TextComponent);
//   }
//
//   ngAfterViewInit() {
//     this.activeSections = this.sections.reduce((result, section, index) => {
//       if(section.active) {
//         result.push(section);
//       }
//       return result;
//     }, []);
//   }
//
//    onAddComponentClick() {
//     this.activeSections.forEach((section) => {
//       section.viewContainerRef.createComponent(this.textComponentFactory);
//     });
//    }
// }
