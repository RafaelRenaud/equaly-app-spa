import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyHubComponent } from './company-hub.component';

describe('HubComponent', () => {
  let component: CompanyHubComponent;
  let fixture: ComponentFixture<CompanyHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyHubComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
