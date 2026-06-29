import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurFeedbackHubComponent } from './occur-feedback-hub.component';

describe('OccurFeedbackHubComponent', () => {
  let component: OccurFeedbackHubComponent;
  let fixture: ComponentFixture<OccurFeedbackHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurFeedbackHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurFeedbackHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
