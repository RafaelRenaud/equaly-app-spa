import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RncFormEditComponent } from './rnc-form-edit.component';

describe('RncFormEditComponent', () => {
  let component: RncFormEditComponent;
  let fixture: ComponentFixture<RncFormEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RncFormEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RncFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
