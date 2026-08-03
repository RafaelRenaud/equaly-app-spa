import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixesComponent } from './fixes.component';

describe('FixesComponent', () => {
  let component: FixesComponent;
  let fixture: ComponentFixture<FixesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
