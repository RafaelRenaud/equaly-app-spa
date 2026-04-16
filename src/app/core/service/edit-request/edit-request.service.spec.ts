import { TestBed } from '@angular/core/testing';

import { EditRequestService } from './edit-request.service';

describe('EditRequestService', () => {
  let service: EditRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
