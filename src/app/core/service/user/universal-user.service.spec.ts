import { TestBed } from '@angular/core/testing';

import { UniversalUserService } from './universal-user.service';

describe('UniversalUserService', () => {
  let service: UniversalUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniversalUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
