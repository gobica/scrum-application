import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSprintDialogComponent } from './edit-sprint-dialog.component';

describe('EditSprintDialogComponent', () => {
  let component: EditSprintDialogComponent;
  let fixture: ComponentFixture<EditSprintDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSprintDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSprintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
