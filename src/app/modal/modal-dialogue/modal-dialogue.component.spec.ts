import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDialogueComponent } from './modal-dialogue.component';

describe('ModalDialogueComponent', () => {
  let component: ModalDialogueComponent;
  let fixture: ComponentFixture<ModalDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
