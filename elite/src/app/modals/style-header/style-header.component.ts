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
import {IColumn} from "../../interfaces";
import {Subject} from "rxjs";
import {ColumnService} from "../../services";
import {takeUntil, tap} from "rxjs/operators";
import {TextAlign} from "@syncfusion/ej2-angular-grids";

@Component({
  selector: 'app-style-header',
  templateUrl: './style-header.component.html',
  styleUrls: ['./style-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StyleHeaderComponent implements OnInit, OnDestroy {
  @Output()
  public readonly close: EventEmitter<IColumn | undefined> = new EventEmitter<IColumn | undefined>();

  @Input()
  public set visible(value: boolean) {
    this._visible = value;
    this.detach();
  }

  public get visible(): boolean {
    return this._visible;
  }

  public form = {
    field: '',
    textAlign: 'Left',
    headerTextAlign: 'Left',
    type: 'Text',
    editType: 'Text',
    minWidth: 200,
    maxWidth: 400,
    headerText: '',
    defaultValue: '',
    style: {
      backgroundColor: '',
      fontColor: '',
      fontSize: '',
      wordWrap: ''
    }
  };

  public types = ['Text', 'Number', 'Date', 'Boolean'];
  public editTypes = ['Text', 'Number', 'Date', 'Boolean', 'DropDownList'];
  public alignments = ['Left', 'Center', 'Right', 'Justify'];
  protected _visible = false;
  protected readonly _destroy$ = new Subject();

  constructor(
    protected readonly columnService: ColumnService,
    protected readonly cdr: ChangeDetectorRef
  ) {
  }

  public ngOnInit(): void {
    this.columnService.selected$.pipe(
      tap((value) => {
        const data = this.columnService.selectedData;
        if (data) {
          this.form = {
            field: data.field as string,
            textAlign: data.textAlign as TextAlign,
            headerTextAlign: data.headerTextAlign as TextAlign,
            type: data.type as string,
            editType: data.editType as string,
            minWidth: data.minWidth as number,
            maxWidth: data.maxWidth as number,
            headerText: data.headerText as string,
            defaultValue: data.defaultValue as string,
            style: {
              fontSize: data.style?.fontSize || '',
              backgroundColor: data.style?.backgroundColor || '',
              wordWrap: data.style?.wordWrap || '',
              fontColor: data.style?.fontColor || ''
            }
          }
        }
      }),
      takeUntil(this._destroy$)
    ).subscribe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public submit(): void {
    this._visible = false;
    this.cdr.detectChanges();
    this.close.emit();
    this.columnService.update(this.form as IColumn);
  }

  public detach(): void {
    this.cdr.detectChanges();
  }
}
