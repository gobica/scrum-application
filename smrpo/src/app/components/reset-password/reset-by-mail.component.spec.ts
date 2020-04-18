import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetByMailComponent } from './reset-by-mail.component';

describe('ResetByMailComponent', () => {
  let component: ResetByMailComponent;
  let fixture: ComponentFixture<ResetByMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetByMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetByMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
