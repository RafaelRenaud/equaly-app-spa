import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialHubComponent } from './credential-hub.component';

describe('HubComponent', () => {
  let component: CredentialHubComponent;
  let fixture: ComponentFixture<CredentialHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialHubComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CredentialHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
