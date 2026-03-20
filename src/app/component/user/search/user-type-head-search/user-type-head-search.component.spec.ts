import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTypeHeadSearchComponent } from './user-type-head-search.component';

describe('UserTypeHeadSearchComponent', () => {
  let component: UserTypeHeadSearchComponent;
  let fixture: ComponentFixture<UserTypeHeadSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTypeHeadSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTypeHeadSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
