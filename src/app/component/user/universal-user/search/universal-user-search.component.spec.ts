import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalUserSearchComponent } from './universal-user-search.component';

describe('UniversalUserSearchComponent', () => {
  let component: UniversalUserSearchComponent;
  let fixture: ComponentFixture<UniversalUserSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversalUserSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniversalUserSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
