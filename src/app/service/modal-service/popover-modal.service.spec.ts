/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PopoverModalService } from './popover-modal.service';

describe('Service: PopoverModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PopoverModalService]
    });
  });

  it('should ...', inject([PopoverModalService], (service: PopoverModalService) => {
    expect(service).toBeTruthy();
  }));
});
