import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteSprintComponent } from './dialog-delete-sprint.component';

describe('DialogDeleteSprintComponent', () => {
  let component: DialogDeleteSprintComponent;
  let fixture: ComponentFixture<DialogDeleteSprintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDeleteSprintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteSprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
