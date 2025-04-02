import {
  params as originalParams,
  ParamsSnapshot,
} from '@algoristic/tinyparams';
import { startWith, Subject } from 'rxjs';

import { ObservableParam, ObservableParams } from './observable-params.model';

const snapshotsSubject$ = new Subject<ParamsSnapshot>();
originalParams.watch((snapshot) => snapshotsSubject$.next(snapshot));

export const params: ObservableParams = Object.assign(
  (...args: Parameters<typeof originalParams>): ObservableParam => {
    const paramSubject$ = new Subject<string | undefined>();

    const originalParam = originalParams(...args);
    originalParam.watch((value) => paramSubject$.next(value));

    const observableParam: ObservableParam = Object.assign(originalParam, {
      observe: () => {
        const initialValue = originalParam.getValue();
        return paramSubject$.asObservable().pipe(startWith(initialValue));
      },
    });
    return observableParam;
  },
  originalParams,
  {
    observe: () => {
      const initialValue = originalParams.snapshot();
      return snapshotsSubject$.asObservable().pipe(startWith(initialValue));
    },
  },
);
