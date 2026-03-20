import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurTypeHeadSearchComponent } from './occur-type-head-search.component';

describe('OccurTypeHeadSearchComponent', () => {
  let component: OccurTypeHeadSearchComponent;
  let fixture: ComponentFixture<OccurTypeHeadSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurTypeHeadSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurTypeHeadSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
