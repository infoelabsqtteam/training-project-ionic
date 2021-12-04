import { TestBed } from '@angular/core/testing';

import { DataShareServiceService } from './data-share-service.service';

describe('DataShareServiceService', () => {
  let service: DataShareServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataShareServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
