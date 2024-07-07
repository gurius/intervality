import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimersFormArrayComponent } from './timer-form.component';

describe('TimerFormComponent', () => {
  let component: TimersFormArrayComponent;
  let fixture: ComponentFixture<TimersFormArrayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimersFormArrayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimersFormArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
