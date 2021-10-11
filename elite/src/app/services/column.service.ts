import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {IColumn, IColumnStyle} from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  protected readonly map: Map<string, IColumnStyle | undefined> = new Map<string, IColumnStyle | undefined>();

  protected readonly _columns$: BehaviorSubject<IColumn[]> = new BehaviorSubject<IColumn[]>([]);

  protected readonly _selected$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  protected readonly _eventType$: BehaviorSubject<string> = new BehaviorSubject<string>('reset');

  public get columns$(): Observable<IColumn[]> {
    return this._columns$.asObservable();
  }

  public get columns(): IColumn[] {
    return this._columns$.value.map((e) => ({
      ...e,
      style: this.map.get(e.field as string)
    }));
  }

  public get selected$(): Observable<string | undefined> {
    return this._selected$.asObservable();
  }

  public get selected(): string | undefined {
    return this._selected$.value;
  }

  public get selectedData(): IColumn | undefined {
    return this.columns.find((column) => column.field === this.selected);
  }

  public get eventType$(): Observable<string | undefined> {
    return this._eventType$.asObservable();
  }

  public get eventType(): string | undefined {
    return this._eventType$.value;
  }

  public init(): void {
    this._columns$.next(
      [
        {
          textAlign: 'Center',
          headerTextAlign: 'Center',
          field: 'name',
          type: 'Text',
          editType: 'Text',
          minWidth: 200,
          maxWidth: 400,
          width: 200,
          headerText: 'Full Name',
          defaultValue: 'John Doe {{index}}',
          allowFiltering: false,
          allowSorting: false,
          visible: true,
          index: 1,
          filter: {
            operator: 'contains'
          }
        },
        {
          textAlign: 'Center',
          headerTextAlign: 'Center',
          field: 'email',
          type: 'Text',
          editType: 'Text',
          width: 200,
          minWidth: 200,
          maxWidth: 400,
          headerText: 'Email',
          defaultValue: 'john_doe_{{index}}@gmail.com',
          allowFiltering: false,
          allowSorting: false,
          visible: true,
          index: 2,
          filter: {
            operator: 'contains'
          }
        },
        {
          textAlign: 'Center',
          headerTextAlign: 'Center',
          field: 'phone',
          type: 'Text',
          editType: 'Text',
          width: 200,
          minWidth: 200,
          maxWidth: 400,
          headerText: 'Phone',
          defaultValue: '+1 123 123 123',
          allowFiltering: false,
          allowSorting: false,
          visible: true,
          index: 3,
          filter: {
            operator: 'contains'
          }
        },
        {
          textAlign: 'Center',
          headerTextAlign: 'Center',
          field: 'gender',
          type: 'Text',
          editType: 'Text',
          width: 200,
          minWidth: 200,
          maxWidth: 400,
          headerText: 'Gender',
          defaultValue: 'Male',
          allowFiltering: false,
          visible: true,
          allowSorting: false,
          index: 4,
          filter: {
            operator: 'contains'
          }
        },
        {
          textAlign: 'Center',
          headerTextAlign: 'Center',
          field: 'address',
          type: 'Text',
          editType: 'Text',
          width: 200,
          minWidth: 200,
          maxWidth: 400,
          headerText: 'Address',
          defaultValue: 'US',
          visible: true,
          allowFiltering: false,
          allowSorting: false,
          index: 5,
          filter: {
            operator: 'contains'
          }
        }
      ]
    )
  }

  public remove(field: string): void {
    this._eventType$.next('reset');
    this._columns$.next(
      this.columns.filter((column) => column.field !== field).map((e, i) => ({
        ...e,
        index: i
      })).sort((a, b) => a.index - b.index)
    );
    if (this.selected === field) {
      this._selected$.next(undefined);
    }
  }

  public insert(column: IColumn, position: 'previous' | 'next', targetColumn: IColumn): void {
    column.allowFiltering = false;
    column.allowSorting = false;
    column.isFrozen = targetColumn.isFrozen;
    column.width = column.minWidth;
    column.visible = true;
    column.filter = {
      operator: 'contains'
    };
    const columns = [...this.columns];
    const targetPos = columns.findIndex((column) => column.field === targetColumn.field);
    if (position === 'previous') {
      columns.splice(targetPos, 0, column);
    } else {
      columns.splice(targetPos + 1, 0, column);
    }
    this.map.set(column.field as string, column.style);
    this._eventType$.next('reset');
    this._columns$.next(columns.map((e, i) => ({
      ...e,
      position: i
    })).sort((a, b) => a.index - b.index));
  }

  public update(column: IColumn): void {
    const columns = [...this.columns];
    const pos = columns.findIndex((c) => c.field === column.field);
    if (pos > -1) {
      columns[pos] = {
        ...columns[pos],
        ...column
      };
      this.map.set(column.field as string, column.style);
      this._eventType$.next('reset');
      this._columns$.next(columns.sort((a, b) => a.index - b.index));
    }
  }

  public select(id: string): void {
    this._eventType$.next('select');
    this._selected$.next(id);
  }

  public wrap(prePos: number, nextPos: number): void {
    const columns = [...this.columns];

    const tempPos = columns[prePos].index;
    const tempFrozen = columns[prePos].isFrozen;
    columns[prePos].index = columns[nextPos].index;
    columns[prePos].isFrozen = columns[nextPos].isFrozen;
    columns[nextPos].index = tempPos;
    columns[nextPos].isFrozen = tempFrozen;
    console.log(columns[prePos]);
    console.log(columns[nextPos]);
    this._eventType$.next(tempFrozen || columns[nextPos].isFrozen ? 'rerender' : 'wrap');

    console.log(columns);
    this._columns$.next(
      columns.sort((a, b) => a.index - b.index)
    );

  }

  public frozen(field: string, value: boolean): void {
    this._eventType$.next('rerender');
    const columns = [...this.columns];
    const pos = columns.findIndex((e) => e.field === field);
    if (value) {
      for (let i = 0; i <= pos; i++) {
        columns[i].isFrozen = value;
      }
    } else {
      columns[pos].isFrozen = value;
    }

    this._columns$.next(columns.sort((a, b) => a.index - b.index));
  }

  public allowFilter(field: string, value: boolean): void {
    this._eventType$.next('reset');
    const columns = [...this.columns];
    const pos = columns.findIndex((e) => e.field === field);
    columns[pos].allowFiltering = value;
    this._columns$.next(columns.sort((a, b) => a.index - b.index));
  }

  public allowMultipleSort(field: string, value: boolean): void {
    this._eventType$.next('sort');
    const columns = [...this.columns];
    const pos = columns.findIndex((e) => e.field === field);
    columns[pos].allowSorting = value;
    this._columns$.next(columns.sort((a, b) => a.index - b.index));
  }

  public toggle(data: string): void {
    this._eventType$.next(data);
  }

  public reset(): void {
    this._columns$.next([]);
    this._selected$.next(undefined);
    this._eventType$.next('reset');
  }
}
