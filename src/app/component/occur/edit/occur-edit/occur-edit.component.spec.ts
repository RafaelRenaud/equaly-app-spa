import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurEditComponent } from './occur-edit.component';

describe('OccurEditComponent', () => {
  let component: OccurEditComponent;
  let fixture: ComponentFixture<OccurEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
