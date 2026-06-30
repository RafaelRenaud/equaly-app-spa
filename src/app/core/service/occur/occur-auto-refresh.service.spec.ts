import { TestBed } from '@angular/core/testing';

import { OccurAutoRefreshService } from './occur-auto-refresh.service';

describe('OccurAutoRefreshService', () => {
  let service: OccurAutoRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OccurAutoRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
