import { TestBed } from '@angular/core/testing';

import { IonLoaderService } from './ion-loader.service';

describe('IonLoaderServiceService', () => {
  let service: IonLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IonLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
