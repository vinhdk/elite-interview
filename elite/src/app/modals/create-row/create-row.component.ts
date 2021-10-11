import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy, Output, EventEmitter, Input
} from '@angular/core';
import {ColumnService, RowService} from "../../services";
import {Subject} from "rxjs";
import {IColumn, IRow} from "../../interfaces";
import {takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-create-row',
  templateUrl: './create-row.component.html',
  styleUrls: ['./create-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateRowComponent implements OnInit, OnDestroy {

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

  @Input()
  public set isChild(value: boolean) {
    this._isChild = value;
    this.resetForm();
    this.detach();
  }

  public get isChild(): boolean {
    return this._isChild;
  }

  public form: {[key: string]: any} = {};

  public columns: IColumn[] = [];

  protected readonly destroy$ = new Subject();
  protected _visible = false;
  protected _isChild = false;

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
    this.rowService.insert(this.form as IRow, this.isChild ? 'child' : 'next', this.rowService.selectedData as IRow);
    this.columnService.toggle('rerender');
  }

  public detach(): void {
    this.cdr.detectChanges();
  }

  public resetForm(columns?: IColumn[]): void {
    columns = columns ? columns : [...this.columnService.columns];
    this.columns = [...columns];
    this.form = {};
    columns.forEach((column) => {
      this.form[column.field as string] = column.defaultValue;
    });
  }

}
