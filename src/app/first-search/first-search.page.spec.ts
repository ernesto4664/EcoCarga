import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstSearchPage } from './first-search.page';

describe('FirstSearchPage', () => {
  let component: FirstSearchPage;
  let fixture: ComponentFixture<FirstSearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
