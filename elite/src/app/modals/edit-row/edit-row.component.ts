import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {IColumn, IRow} from "../../interfaces";
import {Subject} from "rxjs";
import {ColumnService, RowService} from "../../services";
import {takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-edit-row',
  templateUrl: './edit-row.component.html',
  styleUrls: ['./edit-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditRowComponent implements OnInit, OnDestroy {

  @Output()
  public readonly close: EventEmitter<IColumn | undefined> = new EventEmitter<IColumn | undefined>();

  @Input()
  public set visible(value: boolean) {
    this._visible = value;
    this.resetForm();
    this.detach();
  }

  public get visible(): boolean {
    return this._visible;
  }

  public form: {[key: string]: any} = {};

  public columns: IColumn[] = [];

  protected readonly destroy$ = new Subject();
  protected _visible = false;

  constructor(
    protected readonly rowService: RowService,
    protected readonly columnService: ColumnService,
    protected readonly cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    this.columnService.columns$
      .pipe(
        tap((columns) => this.resetForm(columns)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public submit(): void {
    this._visible = false;
    this.cdr.detectChanges();
    this.close.emit();
    this.rowService.update({
      uid: this.rowService.selected,
      ...this.form
    } as IRow);
    this.columnService.toggle('rerender');
  }

  public detach(): void {
    this.cdr.detectChanges();
  }

  public resetForm(columns?: IColumn[]): void {
    this.form = {};
    const selectedRow = this.rowService.selectedData as IRow;
    if (selectedRow) {
      columns = columns ? columns : [...this.columnService.columns];
      this.columns = [...columns];
      columns.forEach((column) => {
        this.form[column.field as string] = selectedRow[column.field as string];
      });
    }
  }
}
