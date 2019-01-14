import { Component, Input, OnInit } from '@angular/core';
import { TestReport } from 'src/app/models/test-report.model';
import { TestSuite, TestSuiteStatus } from '../../models/test-suite.model';
import { TestCase, TestCaseStatus } from '../../models/test-case.model';

@Component({
  selector: 'bitrise-test-suite',
  templateUrl: './test-suite.component.html',
  styleUrls: ['./test-suite.component.scss']
})
export class TestSuiteComponent implements OnInit {
  @Input() testReport: TestReport;
  @Input() testSuite: TestSuite;

  TestSuiteStatus = TestSuiteStatus;

  passedTestCaseCount: number;
  failedTestCaseCount: number;

  ngOnInit() {
    this.passedTestCaseCount = this.testSuite.testCases.filter(
      (testCase: TestCase) => testCase.status === TestCaseStatus.passed
    ).length;
    this.failedTestCaseCount = this.testSuite.testCases.filter(
      (testCase: TestCase) => testCase.status === TestCaseStatus.failed
    ).length;
  }
}
