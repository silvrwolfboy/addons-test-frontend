import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { TestReport } from '../../models/test-report.model';
import { TestSuiteStatus, TestSuite } from '../../models/test-suite.model';
import {
  TestReportStoreActionLoad,
  TestReportStoreState,
  TestReportStoreActionFilter
} from '../test-report/test-report.store';

@Component({
  selector: 'bitrise-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  testReports$: Observable<TestReport[]>;
  tabmenuItems: any[];
  selectedSmallTabmenuItem: any;
  summedFailedTestCount: number;

  _selectedStatus = TestSuiteStatus.failed;
  get selectedStatus() {
    return this._selectedStatus;
  }
  set selectedStatus(status: TestSuiteStatus) {
    this._selectedStatus = status;
    this.store.dispatch(new TestReportStoreActionFilter(status));
  }

  statusMenuItems = [{ name: 'All', value: null }].concat(
    [TestSuiteStatus.failed, TestSuiteStatus.passed, TestSuiteStatus.skipped, TestSuiteStatus.inconclusive].map(
      (item) => ({
        name: TestSuite.statusName(item).replace(/^./, (x) => x.toUpperCase()),
        value: item
      })
    )
  );

  constructor(private router: Router, private store: Store<TestReportStoreState>) {
    this.testReports$ = store.select('testReports');

    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      if (this.tabmenuItems !== undefined) {
        this.selectSmallTabmenuItemForUrl(event.url);
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(new TestReportStoreActionLoad());

    this.testReports$.subscribe((testReports) => {
      const failedTestCountsOfTestReports = testReports.map(
        (testReport) => testReport.testsWithStatus(TestSuiteStatus.failed).length
      );

      this.tabmenuItems = [
        {
          name: 'Test Summary',
          routerLink: ['/summary']
        }
      ].concat(
        testReports.map((testReport: TestReport, index: number) => ({
          name: testReport.name,
          routerLink: ['/testreport/' + testReport.id],
          failedTestCount: failedTestCountsOfTestReports[index]
        }))
      );

      this.summedFailedTestCount = failedTestCountsOfTestReports.reduce(
        (summedFailedTestCount: number, failedTestCountOfTestReport: number) =>
          summedFailedTestCount + failedTestCountOfTestReport,
        0
      );

      this.selectSmallTabmenuItemForUrl(this.router.url);
    });
  }

  selectSmallTabmenuItemForUrl(url: string) {
    this.selectedSmallTabmenuItem = this.tabmenuItems.find(
      ({ routerLink: [tabmenuItemUrl] }) => tabmenuItemUrl === url
    );
  }

  selectedSmallTabmenuItemChanged() {
    this.router.navigate(this.selectedSmallTabmenuItem.routerLink);
  }
}
