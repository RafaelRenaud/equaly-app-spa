import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RncViewerComponent } from './rnc-viewer.component';

describe('RncViewerComponent', () => {
  let component: RncViewerComponent;
  let fixture: ComponentFixture<RncViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RncViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RncViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
