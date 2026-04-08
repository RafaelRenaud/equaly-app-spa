import { TestBed } from '@angular/core/testing';

import { OccurService } from './occur.service';

describe('OccurService', () => {
  let service: OccurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OccurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
