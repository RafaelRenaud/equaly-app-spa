import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurHubComponent } from './occur-hub.component';

describe('OccurHubComponent', () => {
  let component: OccurHubComponent;
  let fixture: ComponentFixture<OccurHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
