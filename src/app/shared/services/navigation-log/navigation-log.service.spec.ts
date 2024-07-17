import { TestBed } from '@angular/core/testing';

import { NavigationLogService } from './navigation-log.service';

describe('NavigationLogService', () => {
  let service: NavigationLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
