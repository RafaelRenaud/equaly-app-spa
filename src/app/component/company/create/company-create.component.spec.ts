import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCreateComponent } from './company-create.component';

describe('CreateComponent', () => {
  let component: CompanyCreateComponent;
  let fixture: ComponentFixture<CompanyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
