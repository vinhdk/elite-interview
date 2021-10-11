import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {ColumnService, RowService} from "../../services";
import {IColumn} from "../../interfaces";

@Component({
  selector: 'app-create-header',
  templateUrl: './create-header.component.html',
  styleUrls: ['./create-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateHeaderComponent {

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
      backgroundColor: undefined,
      fontColor: undefined,
      fontSize: undefined,
      wordWrap: undefined
    }
  };

  public types = ['Text', 'Number', 'Date', 'Boolean'];
  public editTypes = ['Text', 'Number', 'Date', 'Boolean', 'DropDownList'];
  public alignments = ['Left', 'Center', 'Right', 'Justify'];
  protected _visible = false;

  constructor(
    protected readonly columnService: ColumnService,
    protected readonly rowService: RowService,
    protected readonly cdr: ChangeDetectorRef
  ) {
  }

  public submit(): void {
    this._visible = false;
    this.cdr.detectChanges();
    this.close.emit();
    this.columnService.insert(this.form as IColumn, 'next', this.columnService.selectedData as IColumn);
    this.rowService.createColumn(this.form.field as string, this.form.defaultValue);
  }

  public resetForm(): void {
    this.form = {
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
        backgroundColor: undefined,
        fontColor: undefined,
        fontSize: undefined,
        wordWrap: undefined
      }
    };
  }

  public detach(): void {
    this.cdr.detectChanges();
  }
}
