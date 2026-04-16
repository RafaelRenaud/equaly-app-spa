import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurFeedbackComponent } from './occur-feedback.component';

describe('OccurFeedbackComponent', () => {
  let component: OccurFeedbackComponent;
  let fixture: ComponentFixture<OccurFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
