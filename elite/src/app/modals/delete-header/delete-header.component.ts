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
  selector: 'app-delete-header',
  templateUrl: './delete-header.component.html',
  styleUrls: ['./delete-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteHeaderComponent {
  @Output()
  public readonly close: EventEmitter<ColumnModel | undefined> = new EventEmitter<ColumnModel | undefined>();

  @Input()
  public visible = false;

  constructor(
    protected readonly columnService: ColumnService,
    protected readonly rowService: RowService,
    protected readonly cdr: ChangeDetectorRef
  ) { }

  public submit(): void {
    const data = this.columnService.selectedData;
    if (data) {
      this.visible = false;
      this.cdr.detectChanges();
      this.close.emit();
      this.rowService.removeColumn(data.field as string);
      this.columnService.remove(data.field as string);
    }

  }
}
