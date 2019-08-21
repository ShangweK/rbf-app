import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AssessmentConfiguration } from '../../../models/assessment-configuration.model';
import { Store } from '@ngrx/store';
import { State } from 'src/app/store/reducers';
import {
  getAssessmentConfigurations,
  getAssessmentConfigErrorState
} from 'src/app/store/selectors';
import { ErrorMessage } from 'src/app/core';
import { MatDialog } from '@angular/material';
import { DeleteAssessmentComponent } from '../delete-assessment/delete-assessment.component';

@Component({
  selector: 'app-assessment-list',
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.css']
})
export class AssessmentListComponent implements OnInit {
  assessmentIndicators$: Observable<AssessmentConfiguration[]>;
  assessmentConfigurationError$: Observable<ErrorMessage>;
  constructor(private store: Store<State>, private dialog: MatDialog) {}

  ngOnInit() {
    this.assessmentIndicators$ = this.store.select(getAssessmentConfigurations);
    this.assessmentConfigurationError$ = this.store.select(
      getAssessmentConfigErrorState
    );
  }

  onDeletConfig(id: string) {
    const dialogRef = this.dialog.open(DeleteAssessmentComponent, {
      width: '350px',
      height: '200px',
      data: id
    });

    dialogRef.afterClosed();
  }
}