import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElectrolinerasPage } from './electrolineras.page';

describe('ElectrolinerasPage', () => {
  let component: ElectrolinerasPage;
  let fixture: ComponentFixture<ElectrolinerasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectrolinerasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
