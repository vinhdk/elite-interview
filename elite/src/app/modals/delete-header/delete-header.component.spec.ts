import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteHeaderComponent } from './delete-header.component';

describe('DeleteHeaderComponent', () => {
  let component: DeleteHeaderComponent;
  let fixture: ComponentFixture<DeleteHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
