import { TestBed } from '@angular/core/testing';

import { OccurTypeService } from '../occurType/occur-type.service';

describe('OccurTypeService', () => {
  let service: OccurTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OccurTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
