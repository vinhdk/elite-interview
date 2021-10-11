import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleHeaderComponent } from './style-header.component';

describe('StyleHeaderComponent', () => {
  let component: StyleHeaderComponent;
  let fixture: ComponentFixture<StyleHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StyleHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
