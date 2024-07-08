import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMenuButtonComponent } from './add-menu-button.component';

describe('AddMenuButtonComponent', () => {
  let component: AddMenuButtonComponent;
  let fixture: ComponentFixture<AddMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddMenuButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
