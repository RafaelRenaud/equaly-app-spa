import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentHubComponent } from './department-hub.component';

describe('DepartmentHubComponent', () => {
  let component: DepartmentHubComponent;
  let fixture: ComponentFixture<DepartmentHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
