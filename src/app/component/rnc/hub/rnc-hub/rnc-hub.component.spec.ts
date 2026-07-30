import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RncHubComponent } from './rnc-hub.component';

describe('RncHubComponent', () => {
  let component: RncHubComponent;
  let fixture: ComponentFixture<RncHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RncHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RncHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
