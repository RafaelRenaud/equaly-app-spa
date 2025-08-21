import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentSearchComponent } from './department-search.component';

describe('DepartmentSearchComponent', () => {
  let component: DepartmentSearchComponent;
  let fixture: ComponentFixture<DepartmentSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
