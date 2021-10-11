export interface IRow {
  uid: string;
  realLevel: number;
  parentId?: string;
  child?: IRow[];
  [key: string]: any;
}
