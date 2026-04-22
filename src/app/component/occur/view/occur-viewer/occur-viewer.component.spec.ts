import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurViewerComponent } from './occur-viewer.component';

describe('OccurViewerComponent', () => {
  let component: OccurViewerComponent;
  let fixture: ComponentFixture<OccurViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
