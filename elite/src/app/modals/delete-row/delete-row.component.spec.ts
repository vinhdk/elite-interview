import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteRowComponent } from './delete-row.component';

describe('DeleteRowComponent', () => {
  let component: DeleteRowComponent;
  let fixture: ComponentFixture<DeleteRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
