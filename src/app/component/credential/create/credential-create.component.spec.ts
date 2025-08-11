import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialCreateComponent } from './credential-create.component';

describe('CredentialCreateComponent', () => {
  let component: CredentialCreateComponent;
  let fixture: ComponentFixture<CredentialCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
