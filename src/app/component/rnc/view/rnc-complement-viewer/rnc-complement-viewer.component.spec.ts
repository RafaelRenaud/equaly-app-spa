import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RncComplementViewerComponent } from './rnc-complement-viewer.component';

describe('RncComplementViewerComponent', () => {
  let component: RncComplementViewerComponent;
  let fixture: ComponentFixture<RncComplementViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RncComplementViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RncComplementViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
