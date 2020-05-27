import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStoryDialogComponent } from './edit-story-dialog.component';

describe('EditStoryDialogComponent', () => {
  let component: EditStoryDialogComponent;
  let fixture: ComponentFixture<EditStoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
