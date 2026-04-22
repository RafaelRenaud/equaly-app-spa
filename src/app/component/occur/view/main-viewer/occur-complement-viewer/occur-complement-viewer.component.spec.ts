import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurComplementViewerComponent } from './occur-complement-viewer.component';

describe('OccurComplementViewerComponent', () => {
  let component: OccurComplementViewerComponent;
  let fixture: ComponentFixture<OccurComplementViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurComplementViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurComplementViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
