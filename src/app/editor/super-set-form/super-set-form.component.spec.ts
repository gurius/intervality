import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperSetFormComponent } from './super-set-form.component';

describe('SuperSetFormComponent', () => {
  let component: SuperSetFormComponent;
  let fixture: ComponentFixture<SuperSetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperSetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperSetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
