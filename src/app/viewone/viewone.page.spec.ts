import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewonePage } from './viewone.page';

describe('ViewonePage', () => {
  let component: ViewonePage;
  let fixture: ComponentFixture<ViewonePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
