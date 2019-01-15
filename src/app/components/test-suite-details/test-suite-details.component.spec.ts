import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TestSuiteDetailsComponent } from './test-suite-details.component';

@Component({
  selector: 'bitrise-test-suite-details-header',
  template: ''
})
class MockTestSuiteDetailsHeaderComponent {}

describe('TestSuiteDetailsComponent', () => {
  let fixture: ComponentFixture<TestSuiteDetailsComponent>;
  let testSuiteDetailsComponent: TestSuiteDetailsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestSuiteDetailsComponent, MockTestSuiteDetailsHeaderComponent],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(TestSuiteDetailsComponent);
    testSuiteDetailsComponent = fixture.debugElement.componentInstance;

    fixture.detectChanges();
  });

  it('creates the test suite details component', () => {
    expect(testSuiteDetailsComponent).not.toBeNull();
  });
});
