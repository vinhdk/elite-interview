import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from "@angular/common";
import {
  TreeGridAllModule,
} from "@syncfusion/ej2-angular-treegrid";
import {DialogModule} from '@syncfusion/ej2-angular-popups';
import {ButtonModule} from '@syncfusion/ej2-angular-buttons';
import {DropDownListAllModule} from '@syncfusion/ej2-angular-dropdowns';
import {
  PageService,
  FilterService,
  EditService,
  ToolbarService,
  SortService,
  ResizeService,
  ExcelExportService,
  PdfExportService,
  ContextMenuService,
  AggregateService,
  SelectionService,
  ColumnChooserService,
  ColumnMenuService,
  CommandColumnService,
  DetailRowService,
  FreezeService,
  InfiniteScrollService,
  ReorderService,
  LoggerService,
  VirtualScrollService,
  RowDDService
} from '@syncfusion/ej2-angular-treegrid';
import {AppComponent} from './containers';
import {TreeComponent} from './components';
import {
  CreateHeaderComponent,
  DeleteHeaderComponent,
  EditHeaderComponent,
  StyleHeaderComponent,
  CreateRowComponent,
  DeleteRowComponent,
  EditRowComponent
} from './modals';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GridAllModule} from "@syncfusion/ej2-angular-grids";

const COMPONENTS = [TreeComponent];
const MODALS = [
  CreateHeaderComponent,
  DeleteHeaderComponent,
  EditHeaderComponent,
  StyleHeaderComponent,
  CreateRowComponent,
  DeleteRowComponent,
  EditRowComponent
];

@NgModule({
  declarations: [
    AppComponent,
    ...COMPONENTS,
    ...MODALS
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TreeGridAllModule,
    DialogModule,
    ButtonModule,
    DropDownListAllModule,
    GridAllModule
  ],
  providers: [
    PageService,
    FilterService,
    EditService,
    ToolbarService,
    SortService,
    ResizeService,
    ExcelExportService,
    PdfExportService,
    ContextMenuService,
    AggregateService,
    SelectionService,
    ColumnChooserService,
    ColumnMenuService,
    CommandColumnService,
    DetailRowService,
    FreezeService,
    InfiniteScrollService,
    ReorderService,
    LoggerService,
    VirtualScrollService,
    RowDDService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
