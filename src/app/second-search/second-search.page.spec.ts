import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondSearchPage } from './second-search.page';

describe('SecondSearchPage', () => {
  let component: SecondSearchPage;
  let fixture: ComponentFixture<SecondSearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
