import { TestBed } from '@angular/core/testing';

import { PlayableService } from './playable.service';

describe('PlayableService', () => {
  let service: PlayableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
