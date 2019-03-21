import { Injectable, Inject } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { PerformanceActionTypes, PerformanceActions, ReceivePerformance } from './actions';
import { BackendService, BACKEND_SERVICE } from 'src/app/services/backend/backend.model';

@Injectable()
export class PerformanceEffects {
  @Effect()
  $fetchReports: Observable<PerformanceActions> = this.actions$.pipe(
    ofType(PerformanceActionTypes.Fetch),
    switchMap(() => this.backendService.getPerformance().pipe(map(performace => new ReceivePerformance(performace))))
  );

  constructor(private actions$: Actions, @Inject(BACKEND_SERVICE) private backendService: BackendService) {}
}
