import { Component, OnInit } from '@angular/core';
import { TestSuiteService } from './test-suite.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'bitrise-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  tabmenuItems: any[];
  selectedSmallTabmenuItem: any;
  summedFailedTestCaseCount: number;

  constructor(private router: Router, private testSuiteService: TestSuiteService) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.selectedSmallTabmenuItem = this.tabmenuItems.find(tabmenuItem => tabmenuItem.routerLink[0] === event['url']);
    });
  }

  ngOnInit() {
    const testSuites = this.testSuiteService.getTestSuites();

    this.tabmenuItems = [
      {
        name: 'Test Summary',
        routerLink: ['/summary']
      }
    ].concat(
      testSuites.map(testSuite => ({
        name: testSuite.name,
        routerLink: ['/testsuite/' + testSuite.id],
        failedTestCaseCount: testSuite.failedTestCaseCount
      }))
    );

    this.summedFailedTestCaseCount = 0;
    testSuites.forEach(testSuite => {
      this.summedFailedTestCaseCount += testSuite.failedTestCaseCount;
    });
  }

  selectedSmallTabmenuItemChanged() {
    this.router.navigate(this.selectedSmallTabmenuItem.routerLink);
  }
}
