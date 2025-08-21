import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurTypeCreateComponent } from './occur-type-create.component';

describe('OccurTypeCreateComponent', () => {
  let component: OccurTypeCreateComponent;
  let fixture: ComponentFixture<OccurTypeCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurTypeCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurTypeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
