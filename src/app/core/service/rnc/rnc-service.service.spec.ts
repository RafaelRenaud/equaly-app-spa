import { TestBed } from '@angular/core/testing';

import { RncServiceService } from './rnc-service.service';

describe('RncServiceService', () => {
  let service: RncServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RncServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
