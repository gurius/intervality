import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayableListComponent } from './playable-list.component';

describe('PlayableListComponent', () => {
  let component: PlayableListComponent;
  let fixture: ComponentFixture<PlayableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayableListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
