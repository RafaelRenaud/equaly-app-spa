import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurComponent } from './occur-create.component';

describe('OccurComponent', () => {
  let component: OccurComponent;
  let fixture: ComponentFixture<OccurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
