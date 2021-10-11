import {ColumnModel} from "@syncfusion/ej2-angular-treegrid";

export interface IColumn extends ColumnModel {
  style?: IColumnStyle;
  index: number;
}

export interface IColumnStyle {
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  wordWrap?: string;
}
