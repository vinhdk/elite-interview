import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {ColumnModel} from "@syncfusion/ej2-angular-treegrid";
import {ColumnService, RowService} from "../../services";

@Component({
  selector: 'app-delete-row',
  templateUrl: './delete-row.component.html',
  styleUrls: ['./delete-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteRowComponent {
  @Output()
  public readonly close: EventEmitter<ColumnModel | undefined> = new EventEmitter<ColumnModel | undefined>();

  @Input()
  public visible = false;

  constructor(
    protected readonly rowService: RowService,
    protected readonly columnService: ColumnService,
    protected readonly cdr: ChangeDetectorRef
  ) { }

  public submit(): void {
    const data = this.rowService.selectedData;
    if (data) {
      this.visible = false;
      this.cdr.detectChanges();
      this.close.emit();
      this.rowService.remove(data.uid);
      this.columnService.toggle('reset');
    }
  }
}
