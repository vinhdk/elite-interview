import {Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {ColumnService, RowService} from "../../services";
import {combineLatest, Subject} from "rxjs";
import {map, takeUntil, tap} from "rxjs/operators";
import {MenuEventArgs} from '@syncfusion/ej2-navigations';
import {IColumn, IRow} from "../../interfaces";
import {PageSettingsModel, SortSettingsModel, TreeGridComponent} from "@syncfusion/ej2-angular-treegrid";
import {FilterSettingsModel} from "@syncfusion/ej2-treegrid/src/treegrid/models/filter-settings-model";
import {ContextMenuItemModel} from "@syncfusion/ej2-angular-grids";
import {RowDragEventArgs} from "@syncfusion/ej2-grids/src/grid/base/interface";

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeComponent implements OnInit, OnDestroy {
  @ViewChild('grid') treegrid!: TreeGridComponent;

  public destroy$ = new Subject();

  public data$ = combineLatest([
    this.columnService.columns$,
    this.rowService.rows$,
    this.columnService.eventType$,
  ])
    .pipe(
      map(([columns, rows, eventType]) => ({
        columns,
        rows,
        eventType
      })),
      tap((data) => {
        console.log(data);
        switch (data.eventType) {
          case 'reset':
            this.refreshTree(data);
            break;
          case 'rerender':
            this.rerender();
            break;
          default:
            break;
        }
      }),
      takeUntil(this.destroy$)
    );


  public contextMenuItems: ContextMenuItemModel[] = [
    {
      text: 'Style Column',
      target: '.e-headercontent',
      id: 'style-header'
    },
    {
      text: 'New Column',
      target: '.e-headercontent',
      id: 'new-header'
    },
    {
      text: 'Del Column',
      target: '.e-headercontent',
      id: 'del-header'
    },
    {
      text: 'Edit Column',
      target: '.e-headercontent',
      id: 'edit-header'
    },
    {
      text: 'Freeze Column',
      target: '.e-headercontent',
      id: 'freeze-header'
    },
    {
      text: 'Un Freeze Column',
      target: '.e-headercontent',
      id: 'un-freeze-header'
    },
    {
      text: 'Follow Filter Column',
      target: '.e-headercontent',
      id: 'follow-filter-header'
    },
    {
      text: 'Un Follow Filter Column',
      target: '.e-headercontent',
      id: 'un-follow-filter-header'
    },
    {
      text: 'Follow Multiple Sort Column',
      target: '.e-headercontent',
      id: 'follow-multiple-sort-header'
    },
    {
      text: 'Un Follow Multiple Sort Column',
      target: '.e-headercontent',
      id: 'un-follow-multiple-sort-header'
    },
    {
      text: 'New Row',
      target: '.e-content',
      id: 'new-row'
    },
    {
      text: 'New Child Row',
      target: '.e-content',
      id: 'new-child-row'
    },
    {
      text: 'Del Row',
      target: '.e-content',
      id: 'del-row'
    },
    {
      text: 'Edit Row',
      target: '.e-content',
      id: 'edit-row'
    },
    {
      text: 'Copy Row',
      target: '.e-content',
      id: 'copy-row'
    },
    {
      text: 'Cut Row',
      target: '.e-content',
      id: 'cut-row'
    },
    {
      text: 'Paste',
      target: '.e-content',
      id: 'paste-row'
    },
    {
      text: 'Paste Child',
      target: '.e-content',
      id: 'paste-child-row'
    },
  ];
  public sortSettings: SortSettingsModel = {columns: []};
  public toolbar: string[] = ['ColumnChooser'];
  public show = true;
  public filterSettings: FilterSettingsModel = {
    hierarchyMode: 'Parent',
    type: 'FilterBar',
    mode: 'Immediate',
  };
  public pageSettings: PageSettingsModel = {pageSize: 50};
  public selectionSettings = {type: 'Multiple'};
  public selectedRows: IRow[] = [];
  public selectedRowElements: HTMLElement[] = [];
  public tempSelectedRows: IRow[] = [];
  public tempSelectedRowElements: HTMLElement[] = [];
  public state: 'copy' | 'cut' | 'nothing' = 'nothing';
  public modals: { [key: string]: { visible: boolean, isChild?: boolean } } = {
    editHeader: {
      visible: false,
    },
    styleHeader: {
      visible: false,
    },
    createHeader: {
      visible: false,
    },
    deleteHeader: {
      visible: false,
    },
    editRow: {
      visible: false,
    },
    createRow: {
      visible: false,
      isChild: false
    },
    deleteRow: {
      visible: false,
    },
  };

  constructor(
    protected readonly columnService: ColumnService,
    protected readonly rowService: RowService,
    protected readonly renderer: Renderer2
  ) {
  }

  public ngOnInit(): void {
    this.columnService.init();

    this.rowService.random(1000);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.columnService.reset();
    this.rowService.reset();
  }

  public contextMenuClick(args: any): void {
    switch (args.element.id) {
      case 'new-header':
        this.modals.createHeader.visible = true;
        break;
      case 'edit-header':
        this.modals.editHeader.visible = true;
        break;
      case 'del-header':
        this.modals.deleteHeader.visible = true;
        break;
      case 'style-header':
        this.modals.styleHeader.visible = true;
        break;
      case 'freeze-header':
        this.columnService.frozen(args.column.field, true);
        break;
      case 'un-freeze-header':
        this.columnService.frozen(args.column.field, false);
        break;
      case 'follow-filter-header':
        this.columnService.allowFilter(args.column.field, true);
        break;
      case 'un-follow-filter-header':
        this.columnService.allowFilter(args.column.field, false);
        break;
      case 'follow-multiple-sort-header':
        this.columnService.allowMultipleSort(args.column.field, true);
        break;
      case 'un-follow-multiple-sort-header':
        this.columnService.allowMultipleSort(args.column.field, false);
        break;
      case 'new-row':
        this.modals.createRow.visible = true;
        this.modals.createRow.isChild = false;
        break;
      case 'new-child-row':
        this.modals.createRow.visible = true;
        this.modals.createRow.isChild = true;
        break;
      case 'edit-row':
        this.modals.editRow.visible = true;
        break;
      case 'del-row':
        this.modals.deleteRow.visible = true;
        break;
      case 'cut-row':
        if (this.state === 'cut') {
          this.selectedRows.push(...this.tempSelectedRows);
          this.selectedRowElements.push(...this.tempSelectedRowElements);
          this.tempSelectedRows = [];
          this.tempSelectedRowElements = [];
        }
        this.cut();
        break;
      case 'copy-row':
        if (this.state === 'copy') {
          this.selectedRows.push(...this.tempSelectedRows);
          this.selectedRowElements.push(...this.tempSelectedRowElements);
          this.tempSelectedRows = [];
          this.tempSelectedRowElements = [];
        }
        this.copy();
        break;
      case 'paste-row':
        this.paste(false);
        break;
      case 'paste-child-row':
        this.paste(true);
        break;
    }
  }

  public contextMenuOpen(args: MenuEventArgs): void {

    let {column, element, rowInfo} = (args as any);

    this.rowService.select(rowInfo.rowData?.uid);
    this.columnService.select(column?.field);

    if (!column) {
      element.classList.add('hidden');
      return;
    }


    const {isFrozen, allowSorting, allowFiltering} = column as IColumn;
    const freeze = element.querySelector('#freeze-header') as HTMLElement;
    const unFreeze = element.querySelector('#un-freeze-header') as HTMLElement;
    const filter = element.querySelector('#follow-filter-header') as HTMLElement;
    const unFilter = element.querySelector('#un-follow-filter-header') as HTMLElement;
    const sort = element.querySelector('#follow-multiple-sort-header') as HTMLElement;
    const unSort = element.querySelector('#un-follow-multiple-sort-header') as HTMLElement;
    const copy = element.querySelector('#copy-row') as HTMLElement;
    const cut = element.querySelector('#cut-row') as HTMLElement;
    const paste = element.querySelector('#paste-row') as HTMLElement;
    const pasteChild = element.querySelector('#paste-child-row') as HTMLElement;
    if (isFrozen) {
      freeze.classList.add('hidden');
      unFreeze.classList.remove('hidden');
    } else {
      freeze.classList.remove('hidden');
      unFreeze.classList.add('hidden');
    }
    if (allowFiltering) {
      filter.classList.add('hidden');
      unFilter.classList.remove('hidden');
    } else {
      filter.classList.remove('hidden');
      unFilter.classList.add('hidden');
    }
    if (allowSorting) {
      sort.classList.add('hidden');
      unSort.classList.remove('hidden');
    } else {
      sort.classList.remove('hidden');
      unSort.classList.add('hidden');
    }

    if (!rowInfo.rowData) {
      return;
    }

    const {uid} = rowInfo.rowData as IRow;

    if (this.state !== 'nothing') {
      const pos = this.selectedRows.findIndex((e) => e.uid === uid);
      if (pos > -1) {
        copy.classList.add('hidden');
        cut.classList.add('hidden');
        paste.classList.add('hidden');
        pasteChild.classList.add('hidden');
      } else {
        if (this.state === 'copy') {
          copy.classList.remove('hidden');
          cut.classList.add('hidden');
        } else {
          copy.classList.add('hidden');
          cut.classList.remove('hidden');
        }

        paste.classList.remove('hidden');
        pasteChild.classList.remove('hidden');
      }
    } else {
      copy.classList.remove('hidden');
      cut.classList.remove('hidden');
      paste.classList.add('hidden');
      pasteChild.classList.add('hidden');
    }


  }

  public actionComplete(event: any): void {
    console.log(event);
    switch (event.requestType) {
      case 'reorder':
        this.columnDrop(event);
        break;
      case 'columnstate':
        event.columns.forEach((e: IColumn) => {
          this.columnService.update(e);
        });
        break;
      case 'paging':
        this.refreshTreeLayout();
        break;
      default:
        break;
    }
  }

  public columnDrop(event: any): void {
    const {fromIndex, toIndex} = event;
    this.columnService.wrap(toIndex, fromIndex);
  }

  public refreshTree(data: { columns: IColumn[], rows: IRow[] }): void {
    this.selectedRows = [];
    this.selectedRowElements = [];
    this.tempSelectedRows = [];
    this.tempSelectedRowElements = [];
    this.state = 'nothing';
    if (this.treegrid) {
      this.treegrid.columns = data.columns.map((e) => ({
        ...e,
        customAttributes: {
          'c-field': e.field
        } as any
      }));
      this.treegrid.dataSource = data.rows;
      this.treegrid.grid.dataSource = data.rows;
      this.refreshTreeLayout();
    }
  }

  public refreshTreeLayout(): void {
    if (this.treegrid) {
      this.treegrid.refresh();
      this.treegrid.grid.refresh();
      this.treegrid.refreshColumns(true);
      this.treegrid.refreshHeader();
      this.treegrid.grid.refreshHeader();
      this.refreshStyle(500);
    }
  }

  public refreshStyle(debounce: number): void {
    const timeout = setTimeout(() => {
      const columns = [...this.columnService.columns];
      columns.forEach((e: any) => {
        const tds = Array.from(this.treegrid.element.querySelectorAll('td'))
          .filter((item) => item.getAttribute('c-field') && (item.getAttribute('c-field') as string) === e.field);
        tds.forEach((td) => {
          this.renderer.setStyle(td, 'color', e.style?.fontColor || '');
          this.renderer.setStyle(td, 'backgroundColor', e.style?.backgroundColor || '');
          this.renderer.setStyle(td, 'fontSize', e.style?.fontSize || '');
          this.renderer.setStyle(td, 'wordWrap', e.style?.wordWrap || '');
        });
        clearTimeout(timeout);
      })
    }, debounce);
  }

  public copy(): void {
    this.state = 'copy';
    this.selectedRowElements.forEach((row) => {
      Array.from(row.children).forEach((e: Element) => {
        (e as HTMLElement).style.backgroundColor = 'pink';
        (e as HTMLElement).style.color = 'white';
      })
    });
  }

  public cut(): void {
    this.state = 'cut';
    this.selectedRowElements.forEach((row) => {
      Array.from(row.children).forEach((e: Element) => {
        (e as HTMLElement).style.backgroundColor = 'pink';
        (e as HTMLElement).style.color = 'white';
      })
    });
  }

  public paste(isChild: boolean): void {
    const selectedRow = this.rowService.selectedData as IRow;
    switch (this.state) {
      case 'copy':
        this.rowService.copy(this.selectedRows, selectedRow, isChild);
        break;
      case 'cut':
        this.rowService.cut(this.selectedRows, selectedRow, isChild);
        break;

    }
    this.resetState();
  }

  public resetState(unRefreshLayout?: boolean): void {
    this.selectedRows = [];
    this.selectedRowElements = [];
    this.tempSelectedRows = [];
    this.tempSelectedRowElements = [];
    this.state = 'nothing';
    if (!unRefreshLayout) {
      this.refreshTreeLayout();
    }
  }

  public rerender(): void {
    this.selectedRows = [];
    this.selectedRowElements = [];
    this.tempSelectedRows = [];
    this.tempSelectedRowElements = [];
    this.state = 'nothing';
    this.show = false;
    const timeout = setTimeout(() => {
      this.show = true;
      clearTimeout(timeout);
    }, 100)
  }

  public rowDrop(event: any): void {
    const timeout = setTimeout(() => {
      this.columnService.toggle('nothing');
      switch (event.dropPosition) {
        case 'topSegment':
          this.rowService.wrap(event.data, event.fromIndex, event.dropIndex, 'top');
          break;
        case 'bottomSegment':
          this.rowService.wrap(event.data, event.fromIndex, event.dropIndex, 'bottom');
          break;
        case 'middleSegment':
          event.data.forEach((row: any) => {
            this.rowService.update({
              uid: row.uid,
              parentId: row.parentItem?.uid,
              realLevel: row.parentItem ? row.parentItem.realLevel + 1 : row.realLevel,
              index: row.index
            } as IRow, row.parentItem ? row.realLevel : undefined);
          })
          break;
      }
      clearTimeout(timeout);
    }, 500);
  }

  public selectionChange(event: any): void {
    if (this.state === 'nothing') {
      this.selectedRows = event.data.length == null ? [event.data] : event.data;
      this.selectedRowElements = event.row.length == null ? [event.row] : event.row;
    } else {
      this.tempSelectedRows = event.data.length == null ? [event.data] : event.data;
      this.tempSelectedRowElements = event.row.length == null ? [event.row] : event.row;
    }
  }

  @HostListener('document:keydown', ['$event'])
  public keydown(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.resetState();
    }
  }
}
