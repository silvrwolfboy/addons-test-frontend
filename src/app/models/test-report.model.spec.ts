import { TestReport, TestReportType } from './test-report.model';
import { TestSuite, TestSuiteStatus } from './test-suite.model';

describe('TestReport', () => {
  let testReport: TestReport;

  beforeEach(() => {
    testReport = new TestReport();
  });

  describe('testsWithStatus', () => {
    beforeEach(() => {
      testReport.testSuites = Array(6)
        .fill(null)
        .map(() => new TestSuite());
    });

    [TestSuiteStatus.inconclusive, TestSuiteStatus.passed, TestSuiteStatus.failed, TestSuiteStatus.skipped].forEach(
      (status: TestSuiteStatus) => {
        describe(`and some test suites have ${status} status`, () => {
          beforeEach(() => {
            testReport.testSuites[0].status = status;
            testReport.testSuites[1].status = status;
          });

          it('returns only those test suites', () => {
            expect(testReport.testsWithStatus(status)).toContain(testReport.testSuites[0]);
            expect(testReport.testsWithStatus(status)).toContain(testReport.testSuites[1]);
            expect(testReport.testsWithStatus(status)).not.toContain(testReport.testSuites[2]);
            expect(testReport.testsWithStatus(status)).not.toContain(testReport.testSuites[3]);
            expect(testReport.testsWithStatus(status)).not.toContain(testReport.testSuites[4]);
            expect(testReport.testsWithStatus(status)).not.toContain(testReport.testSuites[5]);
          });
        });
      }
    );
  });

  describe('typeCssClass', () => {
    beforeEach(() => {
      testReport = new TestReport();
    });

    [
      { testReportType: TestReportType.uiTest, expectedCssClass: 'ui-test' },
      { testReportType: TestReportType.unitTest, expectedCssClass: 'unit-test' }
    ].forEach((specConfig: any) => {
      describe(`when test report has type ${specConfig.testReportType}`, () => {
        beforeEach(() => {
          spyOnProperty(TestReport.prototype, 'type').and.returnValue(specConfig.testReportType);
        });

        it(`returns CSS class ${specConfig.expectedCssClass}`, () => {
          expect(testReport.typeCssClass).toBe(specConfig.expectedCssClass);
        });
      });
    });
  });
});
