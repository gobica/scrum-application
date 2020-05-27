import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteStoryComponent } from './dialog-delete-story.component';

describe('DialogDeleteStoryComponent', () => {
  let component: DialogDeleteStoryComponent;
  let fixture: ComponentFixture<DialogDeleteStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDeleteStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
