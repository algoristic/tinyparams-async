import { Param, ParamsFn, ParamsSnapshot } from '@algoristic/tinyparams';
import { Observable } from 'rxjs';

export interface ObservableParam extends Param {
  observe(): Observable<string | undefined>;
}

export interface ObservableParams extends ParamsFn {
  (key: string): ObservableParam;
  observe(): Observable<ParamsSnapshot>;
}
