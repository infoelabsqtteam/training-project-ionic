import { TestBed } from '@angular/core/testing';

import { AndroidpermissionsService } from './androidpermissions.service';

describe('AndroidpermissionsService', () => {
  let service: AndroidpermissionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AndroidpermissionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
