import { TestBed } from '@angular/core/testing';

import { RncAutoRefreshService } from './rnc-auto-refresh.service';

describe('RncAutoRefreshService', () => {
  let service: RncAutoRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RncAutoRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
