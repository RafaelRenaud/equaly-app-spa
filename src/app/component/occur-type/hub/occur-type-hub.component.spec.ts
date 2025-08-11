import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurTypeHubComponent } from './occur-type-hub.component';

describe('OccurTypeHubComponent', () => {
  let component: OccurTypeHubComponent;
  let fixture: ComponentFixture<OccurTypeHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurTypeHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurTypeHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
