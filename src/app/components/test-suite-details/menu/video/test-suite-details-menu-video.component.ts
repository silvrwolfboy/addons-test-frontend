import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TestReport } from 'src/app/models/test-report.model';
import { TestSuite } from 'src/app/models/test-suite.model';

@Component({
  selector: 'bitrise-test-suite-details-menu-video',
  templateUrl: './test-suite-details-menu-video.component.html',
  styleUrls: ['./test-suite-details-menu-video.component.scss']
})
export class TestSuiteDetailsMenuVideoComponent {
  subscription = new Subscription();
  loadProgress = {
    message: '',
    cssClass: '',
    isInProgress: false,
    isError: false,
    isSuccess: true
  };

  playedDuration = 0;
  hoveredPoint: number;
  duration: number;
  isExpandMode = false;

  videoURL: string;

  set isPlaying(play: boolean) {
    if (!this.video) {
      return;
    }

    if (play) {
      this.video.play();
      this.playerUpdate();
    } else {
      this.video.pause();
    }
  }

  get isPlaying() {
    if (!this.video) {
      return false;
    }

    return !this.video.paused;
  }

  video: HTMLVideoElement;

  constructor(private zone: NgZone, private activatedRoute: ActivatedRoute) {}

  playerUpdate() {
    this.playedDuration = this.video.currentTime;
    if (this.isPlaying && requestAnimationFrame) {
      requestAnimationFrame(() => this.zone.run(() => this.playerUpdate()));
    }
  }

  @ViewChild('player')
  set player(_video: ElementRef<HTMLVideoElement>) {
    this.video = _video.nativeElement;

    if (this.video.readyState > 3) {
      this.duration = this.video.duration;
    } else {
      this.video.addEventListener('canplaythrough', () => {
        this.zone.run(() => {
          this.duration = this.video.duration;
        });
      });
    }
  }

  updateSeek($event?: MouseEvent, button?: HTMLButtonElement) {
    if ($event) {
      const width = button.getBoundingClientRect().width;
      this.hoveredPoint = $event.offsetX / width;
    } else {
      this.hoveredPoint = null;
    }
  }

  seekTo($event: MouseEvent, button?: HTMLButtonElement) {
    const width = button.getBoundingClientRect().width;
    this.video.currentTime = this.duration * ($event.offsetX / width);
    this.playerUpdate();
  }

  ngOnInit() {
    let testReport: TestReport;
    let testSuite: TestSuite;

    this.subscription.add(
      this.activatedRoute.parent.data.subscribe(
        (data: { testSuite: { selectedTestReport: TestReport; selectedTestSuite: TestSuite } }) => {
          testReport = data.testSuite.selectedTestReport;
          testSuite = data.testSuite.selectedTestSuite;

          if (testReport && testSuite) {
            this.videoURL = testSuite.videoUrl;
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
