import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRejectCommentComponent } from './add-reject-comment.component';

describe('AddRejectCommentComponent', () => {
  let component: AddRejectCommentComponent;
  let fixture: ComponentFixture<AddRejectCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRejectCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRejectCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
