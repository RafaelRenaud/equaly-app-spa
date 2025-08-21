import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurTypeEditComponent } from './occur-type-edit.component';

describe('OccurTypeEditComponent', () => {
  let component: OccurTypeEditComponent;
  let fixture: ComponentFixture<OccurTypeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurTypeEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurTypeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
