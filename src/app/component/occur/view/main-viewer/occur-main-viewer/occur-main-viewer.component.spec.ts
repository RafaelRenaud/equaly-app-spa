import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurMainViewerComponent } from './occur-main-viewer.component';

describe('OccurMainViewerComponent', () => {
  let component: OccurMainViewerComponent;
  let fixture: ComponentFixture<OccurMainViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurMainViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurMainViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
