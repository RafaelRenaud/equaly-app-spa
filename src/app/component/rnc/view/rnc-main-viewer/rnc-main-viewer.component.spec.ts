import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RncMainViewerComponent } from './rnc-main-viewer.component';

describe('RncMainViewerComponent', () => {
  let component: RncMainViewerComponent;
  let fixture: ComponentFixture<RncMainViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RncMainViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RncMainViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
