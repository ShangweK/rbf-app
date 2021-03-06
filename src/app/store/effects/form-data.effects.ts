import { Injectable } from '@angular/core';
import { FormDataService } from 'src/app/shared/services/form-data.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  addFormDatavalues,
  addFormDatavaluesSuccess,
  addFormDatavaluesFail,
} from '../actions';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { FormDataValue } from 'src/app/shared/models/form-data.model';
import { of } from 'rxjs';
import { State } from '../reducers/index';
import { Store } from '@ngrx/store';
import { getAssessmentDataSetId } from '../selectors/general-configuration.selectors';
import { ErrorMessage } from '../../core/models/error-message.model';
import { loadFormDataValuesFail } from '../actions/form-data.actions';
import { getSanitizedFormData } from '../../shared/helpers/get-sanitized-form-data.helper';
import {
  loadFormDataValues,
  loadFormDataValuesSuccess,
} from '../actions/form-data.actions';
import * as _ from 'lodash';

@Injectable()
export class FormDataEffects {
  constructor(
    private formDataService: FormDataService,
    private actions$: Actions,
    private store: Store<State>
  ) {}

  loadFormDataValues$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadFormDataValues),
      withLatestFrom(this.store.select(getAssessmentDataSetId)),
      mergeMap(([action, dataset]) => {
        const dataSetPayload = {
          ...action.dataRequest,
          dataSet: dataset,
        };
        return this.formDataService.getFormDataValues(dataSetPayload).pipe(
          map(result => {
            const sanitizedFormDataValues = _.map(
              result['dataValues'],
              dataValue => getSanitizedFormData(dataValue)
            );

            console.log(sanitizedFormDataValues);
            return loadFormDataValuesSuccess({
              formDataValues: sanitizedFormDataValues,
            });
          }),
          catchError((error: ErrorMessage) => {
            console.log(error);
            return of(loadFormDataValuesFail({ error }));
          })
        );
      })
    )
  );
  addFormDataValues$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addFormDatavalues),
      withLatestFrom(this.store.select(getAssessmentDataSetId)),
      mergeMap(([action, dataSet]) => {
        const dataValues = {
          ...action.payload,
          dataSet: dataSet,
        };

        console.log(dataValues);
        return this.formDataService.sendFormDataValue(dataValues).pipe(
          map(() => {
            const dataValue: FormDataValue = {
              id: action.payload.dataElement,
              val: action.payload.value,
              com: 'false',
            };
            console.log(dataValue);
            return addFormDatavaluesSuccess({ formDataValues: dataValue });
          }),
          catchError(error => {
            console.log(JSON.stringify(error));
            return of(addFormDatavaluesFail({ error: error }));
          })
        );
      })
    )
  );
}
