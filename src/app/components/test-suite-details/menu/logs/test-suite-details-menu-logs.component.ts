import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Log } from 'src/app/models/log.model';
import { LogLine } from 'src/app/models/log-line.model';
import { LogLineLevel } from 'src/app/models/log-line-level.model';
import { FetchLog } from 'src/app/store/log/actions';
import { TestReport } from 'src/app/models/test-report.model';
import { TestSuite } from 'src/app/models/test-suite.model';
import { LogResult } from 'src/app/services/backend/backend.model';
import { LogStoreState } from 'src/app/store/log/reducer';

const INITIAL_MAXIMUM_NUMBER_OF_VISIBLE_LINES = 20;

@Component({
  selector: 'bitrise-test-suite-details-menu-logs',
  templateUrl: './test-suite-details-menu-logs.component.html',
  styleUrls: ['./test-suite-details-menu-logs.component.scss']
})
export class TestSuiteDetailsMenuLogsComponent implements OnInit, OnDestroy {
  subscription = new Subscription();
  testReport: TestReport;
  testSuite: TestSuite;
  downloadLogURL: string;

  levelFilterItems = [
    {
      name: 'All Logs',
      acceptedLevels: null
    },
    {
      name: 'Errors',
      acceptedLevels: [LogLineLevel.assert, LogLineLevel.error]
    },
    {
      name: 'Warnings',
      acceptedLevels: [LogLineLevel.warning]
    }
  ];
  selectedLevelFilterItem = this.levelFilterItems[0];
  maximumNumberOfVisibleLines: Number;
  INITIAL_MAXIMUM_NUMBER_OF_VISIBLE_LINES = INITIAL_MAXIMUM_NUMBER_OF_VISIBLE_LINES;

  log$: Observable<any>;
  log: Log;
  filteredLogLines: LogLine[];

  constructor(
    private store: Store<{
      log: LogStoreState;
    }>,
    private activatedRoute: ActivatedRoute
  ) {
    this.log$ = store.select('log');

    this.subscription.add(
      this.activatedRoute.parent.data.subscribe(
        (data: { testSuite: { selectedTestReport: TestReport; selectedTestSuite: TestSuite } }) => {
          this.testReport = data.testSuite.selectedTestReport;
          this.testSuite = data.testSuite.selectedTestSuite;

          this.store.dispatch(new FetchLog({ testReport: this.testReport, testSuite: this.testSuite }));
        }
      )
    );
  }

  selectedLevelFilterItemChanged() {
    this.updateFilteredLogLines();
    this.resetMaximumNumberOfVisibleLines();
  }

  ngOnInit() {
    this.subscription.add(
      this.log$.subscribe((logResult: LogResult) => {
        if (!logResult.logs) {
          return;
        }

        const logData = logResult.logs[this.testReport.id][this.testSuite.id];
        this.log = logData.log;
        this.downloadLogURL = logData.downloadURL;

        this.updateFilteredLogLines();
        this.resetMaximumNumberOfVisibleLines();
      })
    );
  }

  updateFilteredLogLines() {
    this.filteredLogLines = this.log.lines.filter(
      (logLine: LogLine) =>
        !this.selectedLevelFilterItem.acceptedLevels ||
        this.selectedLevelFilterItem.acceptedLevels.includes(logLine.level)
    );
  }

  resetMaximumNumberOfVisibleLines() {
    this.maximumNumberOfVisibleLines = INITIAL_MAXIMUM_NUMBER_OF_VISIBLE_LINES;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
