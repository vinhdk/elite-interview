import {Injectable} from '@angular/core';
import {ColumnService} from "./column.service";
import {BehaviorSubject, from, Observable} from "rxjs";
import {IColumn, IRow} from "../interfaces";
import {v4} from "uuid";
import {row} from "@syncfusion/ej2-angular-grids";

@Injectable({
  providedIn: 'root'
})
export class RowService {

  protected readonly map: Map<string, IRow> = new Map<string, IRow>();

  protected readonly _rows$: BehaviorSubject<IRow[]> = new BehaviorSubject<IRow[]>([]);

  protected readonly _selected$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);

  public get rows$(): Observable<IRow[]> {
    return this._rows$.asObservable();
  }

  public get rows(): IRow[] {
    const rows = this.getAllByLevel(0);
    return rows.map((row) => this.getLevel(row));
  }

  public select(id: string): void {
    this._selected$.next(id);
  }

  public get selected$(): Observable<string | undefined> {
    return this._selected$.asObservable();
  }

  public get selected(): string | undefined {
    return this._selected$.value;
  }

  public get selectedData(): IRow | undefined {
    return this.selected ? this.map.get(this.selected) : undefined;
  }

  constructor(
    protected readonly columnService: ColumnService
  ) {
  }

  public random(length: number): void {
    const columns = this.columnService.columns;
    const rows: IRow[] = [];
    for (let i = 0; i < length; i++) {
      const row: IRow = {
        uid: v4(),
        realLevel: 0,
        index: i
      };
      for (let k = 0; k < columns.length; k++) {
        const column = columns[k];
        row[column.field as string] = column.type === 'Text' ? (column.defaultValue as string).replace('{{index}}', (i + 1).toString()) : column.defaultValue;
      }
      rows.push(row);
      this.map.set(row.uid, row);
    }
    this._rows$.next(this.rows);
  }

  public getLevel(value: IRow): IRow {
    const rows = this.getAllByLevel(value.realLevel + 1).filter((e) => e.parentId === value.uid);
    return {
      ...value,
      child: rows.map((row) => this.getLevel(row)),
    }
  }

  public getAllByLevel(level: number): IRow[] {
    return Array.from(this.map.values()).filter((row) => row.realLevel === level).sort((a, b) => a.index - b.index);
  }

  public insert(row: IRow, position: 'child' | 'next', targetRow: IRow): void {
    const rows = this.getAllByLevel(position === 'child' ? targetRow.realLevel + 1 : targetRow.realLevel);
    row.uid = v4();
    row.realLevel = position === 'child' ? targetRow.realLevel + 1 : targetRow.realLevel;
    row.parentId = position === 'child' ? targetRow.uid : targetRow.parentId;
    if (position === 'child') {
      const max = Math.max(...rows.map((e) => e.index));
      row.index = rows.length > 0 ? max + 1 : 0;
    } else {
      row.index = targetRow.index + 1;
      rows.filter((e) => e.index > targetRow.index).forEach((e) => {
        e.index = e.index + 1;
        this.updateNoEmit(e);
      });
    }
    this.map.set(row.uid, row);
    this._rows$.next(this.rows);
  }

  public update(row: IRow, oldLevel?: number): void {
    this.updateNoEmit(row, oldLevel);
    this._rows$.next(this.rows);
  }

  public updateNoEmit(row: IRow, oldLevel?: number): void {
    const foundedRow = this.map.get(row.uid);
    this.map.set(row.uid, {
      ...foundedRow,
      ...row
    });
    if (oldLevel != null) {
      const child = this.getAllByLevel(oldLevel + 1).filter((e) => e.parentId === row.uid);
      child.forEach((e) => this.updateNoEmit({
        ...e,
        realLevel: row.realLevel + 1
      }), oldLevel + 1)
    }
  }

  public wrap(rowDrags: any[], fromIndex: number, dropIndex: number, position: 'top' | 'bottom'): void {
    const rowDrag = rowDrags[0];

    if (rowDrag.parentItem?.uid === rowDrag.parentId) {
      const others = this.getAllByLevel(rowDrag.realLevel).filter((e) => e.parentId === rowDrag.parentId);
      const direction = fromIndex > dropIndex ? 'up' : 'down';
      const items = others.splice(fromIndex, rowDrags.length);
      if (position === 'top') {
        if (direction === 'up') {
          others.splice(dropIndex - 1, 0, ...items);
        } else {
          others.splice(dropIndex - 1 - rowDrags.length, 0, ...items);
        }
      } else {
        if (direction === 'up') {
          others.splice(dropIndex, 0, ...items);
        } else {
          others.splice(dropIndex - rowDrags.length, 0, ...items);
        }
      }
      others.forEach((e, i) => {
        e.index = i;
        this.map.set(e.uid, e);
      })
    } else {
      const previous = this.getAllByLevel(rowDrag.realLevel).filter((e) => e.parentId === rowDrag.parentId);
      const current = this.getAllByLevel(rowDrag.level).filter((e) => e.parentId === rowDrag.parentItem?.uid);
      const items = previous.splice(fromIndex, rowDrags.length);
      previous.forEach((e, i) => {
        e.index = i;
        this.map.set(e.uid, e);
      });
      items.forEach((item) => {
        item.realLevel = rowDrag.level;
        item.parentId = rowDrag.parentItem?.uid;
        this.updateNoEmit(item, rowDrag.realLevel);
      })
      if (position === 'top') {
        current.splice(dropIndex - 1, 0, ...items);
      } else {
        current.splice(dropIndex, 0, ...items);
      }
      current.forEach((e, i) => {
        e.index = i;
        this.map.set(e.uid, e);
      });
    }
    this._rows$.next(this.rows);
  }

  public remove(id: string): void {
    const row = this.map.get(id) as IRow;
    const child = this.getAllByLevel(row.realLevel + 1);
    child.forEach((e) => this.remove(e.uid));
    this.map.delete(id);
    if (this.selected === id) {
      this._selected$.next(undefined);
    }
    this._rows$.next(this.rows);
  }

  public cut(rowCuts: any[], targetRow: IRow, isChild?: boolean): void {
    const rows: IRow[] = rowCuts.map((e) => e.taskData);
    rows.forEach((e, index) => this.cutRow(e, targetRow, index, isChild));
    this.updateIndex(0);
    this.columnService.toggle('reset');
    this._rows$.next(this.rows);
  }

  public cutRow(row: IRow, targetRow: IRow, index: number, isChild?: boolean): void {
    if (isChild) {
      const child = this.getAllByLevel(targetRow.realLevel + 1).filter((e) => e.parentId === targetRow.uid);
      const oldLevel = row.realLevel;
      row.parentId = targetRow.uid;
      row.realLevel = targetRow.realLevel + 1;
      row.index = child.length;
      const rowChild = this.getAllByLevel(oldLevel + 1).filter((e) => e.parentId === row.uid);
      rowChild.forEach((rc, i) => this.copyRow(rc, row, i, true));
    } else {
      const child = this.getAllByLevel(targetRow.realLevel).filter((e) => e.parentId === targetRow.parentId);
      row.parentId = targetRow.parentId;
      row.realLevel = targetRow.realLevel;
      row.index = targetRow.index + 1 + index;
      child.filter((e) => e.index > targetRow.index + index).forEach((e) => {
        e.index = e.index + 1;
        this.map.set(e.uid, e);
      });
    }
    this.map.set(row.uid, row);
  }

  public copy(rowCuts: any[], targetRow: IRow, isChild?: boolean): void {
    const rows: IRow[] = rowCuts.map((e) => e.taskData);
    rows.forEach((e, index) => this.copyRow(e, targetRow, index, isChild));
    this.columnService.toggle('reset');
    this._rows$.next(this.rows);
  }

  public copyRow(row: IRow, targetRow: IRow, index: number, isChild?: boolean): void {
    const oldUid = row.uid;
    row.uid = v4();
    if (isChild) {
      const child = this.getAllByLevel(targetRow.realLevel + 1).filter((e) => e.parentId === targetRow.uid);
      const oldLevel = row.realLevel;
      row.parentId = targetRow.uid;
      row.realLevel = targetRow.realLevel + 1;
      row.index = child.length;
      const rowChild = this.getAllByLevel(oldLevel + 1).filter((e) => e.parentId === oldUid);
      rowChild.forEach((rc, i) => this.copyRow(rc, row, i, true));
    } else {
      const child = this.getAllByLevel(targetRow.realLevel).filter((e) => e.parentId === targetRow.parentId);
      row.parentId = targetRow.parentId;
      row.realLevel = targetRow.realLevel;
      row.index = targetRow.index + 1 + index;
      child.filter((e) => e.index > targetRow.index + index).forEach((e) => {
        e.index = e.index + 1;
        this.map.set(e.uid, e);
      });
    }
    this.map.set(row.uid, row);
  }

  public updateIndex(level: number, parentId?: string): void {
    const rows = this.getAllByLevel(level).filter((e) => e.parentId === parentId);
    rows.forEach((e, i) => {
      e.index = i;
      this.updateIndex(level - 1, e.uid);
      this.map.set(e.uid, e);
    });
  }

  public removeColumn(name: string): void {
    const rows = [...this.rows];
    rows.forEach((row) => {
      delete row[name];
      this.map.set(row.uid, row);
    });
    this._rows$.next(this.rows);
  }

  public createColumn(name: string, defaultValue: any): void {
    const rows = [...this.rows].map((e, i) => ({
      ...e,
      [name]: typeof defaultValue === 'string' ? defaultValue.replace('{{index}}', (i + 1).toString()) : defaultValue
    }));
    rows.forEach((row) => {
      this.map.set(row.uid, row);
    })
    this._rows$.next(
      rows
    )
  }

  public reset(): void {
    this._rows$.next([]);
    this.map.clear();
  }
}
