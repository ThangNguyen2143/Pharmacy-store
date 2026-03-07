import { Injectable } from '@nestjs/common';
import jsPDF, { TextOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { index, TableOptions } from './pdf.interface';
import { font } from './fontThemifiy';

@Injectable()
export class PdfService {
  private doc: jsPDF;
  private readonly filePath = './output.pdf';
  private readonly xMargin = 40;
  private readonly yMargin = 30;
  private indexData: index[] = [];
  private x: number;
  private y: number;

  private defaultTableOptions: TableOptions = {
    tableName: 'Chi tiết hoá đơn',
    ignoreFields: [],
    addToIndex: false,
  };
  private config = () => {
    this.doc.addFileToVFS('MyFont.ttf', font);
    this.doc.addFont('MyFont.ttf', 'MyFont', 'normal');
    this.doc.setFont('MyFont');
    this.resetXandY();
    this.updatePointer();
  };
  constructor() {
    this.doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    this.config();
  }

  private resetXandY() {
    this.x = this.xMargin;
    this.y = this.yMargin;
  }

  private async updatePointer() {
    this.doc.context2d.moveTo(this.x, this.y);
  }

  async addNewPage() {
    this.doc.addPage();
    this.resetXandY();
    this.updatePointer();
  }

  // Adds image at position (x, y) with width and height
  async addImage(imageData: Buffer, options?: any) {
    this.doc.addImage(
      imageData,
      'JPEG',
      options?.x || this.x,
      options?.y || this.y,
      options?.width || this.doc.internal.pageSize.getWidth(),
      options?.height || this.doc.internal.pageSize.getHeight(),
    );

    this.y =
      options?.height ||
      this.doc.internal.pageSize.getHeight() + this.doc.getLineHeight();
    this.updatePointer();
  }

  async addGenericTable<T>(dataArr: T[], options: TableOptions) {
    if (dataArr.length === 0) {
      console.error('Thiếu dữ liệu');
      return;
    }

    const mergedOptions: TableOptions = {
      ...this.defaultTableOptions,
      ...options,
      startY: this.y + this.doc.getLineHeight(),
    };

    this.addText(`${mergedOptions.tableName}`);

    if (mergedOptions.addToIndex) {
      this.indexData.push({
        Index: mergedOptions.tableName,
        Page: this.doc.internal.getCurrentPageInfo().pageNumber,
      });
    }

    const headers = Object.keys(dataArr[0]).filter(
      (key) => !mergedOptions.ignoreFields?.includes(key),
    );

    const transformedData = dataArr.map((item: any) =>
      headers.map((key: string) =>
        item[key] instanceof Date ? item[key].toISOString() : item[key],
      ),
    );

    autoTable(this.doc, {
      head: [headers],
      body: transformedData,
      styles: {
        font: 'MyFont',
        fontStyle: 'normal',
      },
      didDrawCell: (data) => {},
      ...mergedOptions,
    });
    this.y = (this.doc as any).lastAutoTable.finalY + this.doc.getLineHeight();
    this.updatePointer();
  }

  async addText(text: string, options?: TextOptions | any) {
    const lines = this.doc.splitTextToSize(
      text,
      this.doc.internal.pageSize.width - this.xMargin * 2,
    );

    if (options?.addToIndex) {
      this.indexData.push({
        Index: text,
        Page: this.doc.internal.getCurrentPageInfo().pageNumber,
      });
    }
    console.log(`posi before writing TEXT '${text}' is ${this.x} & ${this.y}`);
    this.doc.text(lines, options?.x || this.x, options?.y || this.y);
    this.y += this.doc.getTextDimensions(lines).h + this.doc.getLineHeight();
    // console.log(this.doc.getLineHeight(), this.doc.getTextDimensions(lines));
    this.updatePointer();
  }

  async addNewLine() {
    this.y += this.doc.getLineHeight();
    this.x = this.xMargin;
    this.updatePointer();
  }

  async render(): Promise<string> {
    this.addPageNumbers();
    await this.index();
    return new Promise<string>((resolve, reject) => {
      this.doc.save(this.filePath);
      resolve(this.filePath);
    });
  }

  private addPageNumbers() {
    const pageCount = (this.doc as any).internal.getNumberOfPages(); //Total Page Number
    for (let i = 0; i < pageCount; i++) {
      this.doc.setPage(i);
      const pageCurrent = (this.doc as any).internal.getCurrentPageInfo()
        .pageNumber; //Current Page
      this.doc.setFontSize(12);
      this.doc.text(
        'page: ' + pageCurrent + '/' + pageCount,
        this.xMargin,
        this.doc.internal.pageSize.height - this.yMargin / 2,
      );
    }
  }

  private async index() {
    this.doc.setPage(2);
    this.resetXandY();
    this.updatePointer();
    await this.addGenericTable(this.indexData, {
      tableName: `Table of Contents`,
      theme: 'grid',
    });
  }
}
