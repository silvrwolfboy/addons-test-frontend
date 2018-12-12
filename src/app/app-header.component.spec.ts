import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Pipe, PipeTransform, DebugElement, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg';
import { AppHeaderComponent } from './app-header.component';
import { TestReportService } from './test-report.service';
import { TestReport } from './test-report.model';
import { TestSuite } from './test-suite.model';

@Component({
  selector: 'bitrise-test-summary',
  template: ''
})
class MockTestSummaryComponent {}

@Component({
  selector: 'bitrise-test-report',
  template: ''
})
class MockTestReportComponent {}

@Pipe({ name: 'maximizeTo' })
class MockMaximizePipe implements PipeTransform {
  transform(value: number, maximumValue: number, maximumReachedPostfixCharacter: string): string {
    return '9+';
  }
}

class MockTestReportService {
  testReports: TestReport[];

  public getTestReports(): TestReport[] {
    return this.testReports;
  }
}

describe('AppHeaderComponent', () => {
  let location: Location;
  let service: MockTestReportService;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let appHeaderElement: AppHeaderComponent;
  let tabElements: DebugElement[];
  let summedTestSuiteCountElement: DebugElement;
  let dropdownItemElements: DebugElement[];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'summary', component: MockTestSummaryComponent },
          { path: 'testreport/1', component: MockTestReportComponent },
          { path: 'testreport/2', component: MockTestReportComponent },
          { path: 'testreport/3', component: MockTestReportComponent }
        ]),
        HttpClientTestingModule,
        FormsModule,
        InlineSVGModule.forRoot()
      ],
      declarations: [MockMaximizePipe, AppHeaderComponent, MockTestSummaryComponent, MockTestReportComponent],
      providers: [{ provide: TestReportService, useClass: MockTestReportService }]
    }).compileComponents();

    service = TestBed.get(TestReportService);
  }));

  beforeEach(() => {
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(AppHeaderComponent);
    appHeaderElement = fixture.debugElement.componentInstance;
  });

  it('creates the app header', () => {
    expect(appHeaderElement).not.toBeNull();
  });

  describe('when there are some test reports', () => {
    beforeEach(() => {
      service.testReports = [
        { id: 1, name: 'Unit Test A', failedTestSuiteCount: 2 },
        { id: 2, name: 'Unit Test X', failedTestSuiteCount: 0 },
        { id: 3, name: 'Unit Test Y', failedTestSuiteCount: 1 }
      ].map(specConfig => {
        let testReport = new TestReport();
        testReport.id = specConfig.id;
        testReport.name = specConfig.name;
        testReport.testSuites = [...Array(specConfig.failedTestSuiteCount)].fill(null).map(() => {
          let testSuite = new TestSuite();
          testSuite.status = 2;

          return testSuite;
        });

        return testReport;
      });

      fixture.detectChanges();

      tabElements = fixture.debugElement.queryAll(By.css('a.tabmenu-item'));
      summedTestSuiteCountElement = fixture.debugElement.query(By.css('.summed-failed-test-suite-count'));
      dropdownItemElements = fixture.debugElement.queryAll(By.css('.tabmenu-select option'));
    });

    it('loads as many tabs as there are test reports, plus one for the summary', () => {
      expect(tabElements.length).toBe(4);
    });

    it('shows the name of the test reports in the tabs', () => {
      expect(tabElements[1].query(By.css('.text')).nativeElement.textContent).toBe('Unit Test A');
      expect(tabElements[2].query(By.css('.text')).nativeElement.textContent).toBe('Unit Test X');
      expect(tabElements[3].query(By.css('.text')).nativeElement.textContent).toBe('Unit Test Y');
    });

    it('shows bubble for test reports with failed test suites', () => {
      expect(tabElements[1].query(By.css('.notification-bubble'))).not.toBeNull();
      expect(tabElements[3].query(By.css('.notification-bubble'))).not.toBeNull();
    });

    it('does not show bubble for test reports without failed test suites', () => {
      expect(tabElements[2].query(By.css('.notification-bubble'))).toBeNull();
    });

    it('shows the sum of failed test suites in the mobile-only section', () => {
      expect(summedTestSuiteCountElement.query(By.css('.text')).nativeElement.textContent).toBe('3 failed tests');
    });

    it('loads as many items for the mobile-only dropdown as there are test reports, plus one for the summary', () => {
      expect(dropdownItemElements.length).toBe(4);
    });

    it('shows the name of the test reports in the dropdown items', () => {
      expect(dropdownItemElements[1].nativeElement.textContent).toBe('Unit Test A');
      expect(dropdownItemElements[2].nativeElement.textContent).toBe('Unit Test X');
      expect(dropdownItemElements[3].nativeElement.textContent).toBe('Unit Test Y');
    });

    describe('and a test report tab is selected', () => {
      let selectedTabElement: DebugElement;

      beforeEach(fakeAsync(() => {
        selectedTabElement = fixture.debugElement.queryAll(By.css('.tabmenu-item'))[2];
        selectedTabElement.nativeElement.click();
      }));

      it('directs to corresponding route', fakeAsync(() => {
        tick();

        expect(location.path()).toBe('/testreport/2');
      }));
    });

    describe('and a dropdown item is selected', () => {
      let dropdownElement: DebugElement;

      beforeEach(() => {
        dropdownElement = fixture.debugElement.query(By.css('.tabmenu-select'));
        dropdownElement.nativeElement.value = dropdownElement.nativeElement.options[0].value;
        dropdownElement.nativeElement.dispatchEvent(new Event('change'));
      });

      it('calls selectedSmallTabmenuItemChanged', () => {
        spyOn(appHeaderElement, 'selectedSmallTabmenuItemChanged');

        dropdownElement.nativeElement.value = dropdownElement.nativeElement.options[1].value;
        dropdownElement.nativeElement.dispatchEvent(new Event('change'));

        expect(appHeaderElement.selectedSmallTabmenuItemChanged).toHaveBeenCalled();
      });

      it('directs to corresponding route', fakeAsync(() => {
        dropdownElement.nativeElement.value = dropdownElement.nativeElement.options[1].value;
        dropdownElement.nativeElement.dispatchEvent(new Event('change'));

        tick();

        expect(location.path()).toBe('/testreport/1');
      }));
    });
  });

  describe('when there are no test reports', () => {
    beforeEach(() => {
      service.testReports = [];

      fixture.detectChanges();

      tabElements = fixture.debugElement.queryAll(By.css('a.tabmenu-item'));
      summedTestSuiteCountElement = fixture.debugElement.query(By.css('.summed-failed-test-suite-count'));
      dropdownItemElements = fixture.debugElement.queryAll(By.css('.tabmenu-select option'));
    });

    it('loads only one tab for the summary', () => {
      expect(tabElements.length).toBe(1);
    });

    it('shows 0 failed test suites in the mobile-only section', () => {
      expect(summedTestSuiteCountElement.query(By.css('.text')).nativeElement.textContent).toBe('0 failed tests');
    });

    it('loads only one dropdown item for the summary', () => {
      expect(dropdownItemElements.length).toBe(1);
    });
  });
});
