import { TestBed } from '@angular/core/testing';

import { AuditServiceService } from './audit.service';

describe('AuditServiceService', () => {
  let service: AuditServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
