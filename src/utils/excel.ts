import * as XLSX from 'xlsx';

export interface ExcelColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number' | 'date';
}

export interface ExcelValidationResult {
  valid: boolean;
  errors: string[];
  data: Record<string, any>[];
}

export const readExcelFile = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        resolve(jsonData as any[][]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const parseExcelData = (
  rows: any[][],
  columns: ExcelColumn[],
  hasHeader: boolean = true
): ExcelValidationResult => {
  const errors: string[] = [];
  const data: Record<string, any>[] = [];

  const startRow = hasHeader ? 1 : 0;
  const headerRow = hasHeader ? rows[0] : columns.map(c => c.label);

  if (hasHeader) {
    columns.forEach(col => {
      const colIndex = headerRow.findIndex((h: any) => h === col.label);
      if (colIndex === -1 && col.required) {
        errors.push(`缺少必需列: ${col.label}`);
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: [] };
  }

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((cell: any) => cell === undefined || cell === null || cell === '')) {
      continue;
    }

    const rowData: Record<string, any> = {};
    let rowValid = true;

    columns.forEach((col, colIdx) => {
      const headerIndex = hasHeader
        ? headerRow.findIndex((h: any) => h === col.label)
        : colIdx;

      if (headerIndex === -1) return;

      let value = row[headerIndex];

      if (col.required && (value === undefined || value === null || value === '')) {
        errors.push(`第${i + 1}行缺少必需字段: ${col.label}`);
        rowValid = false;
        return;
      }

      if (col.type === 'number' && value !== undefined && value !== null && value !== '') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors.push(`第${i + 1}行${col.label}必须是数字`);
          rowValid = false;
          return;
        }
        value = numValue;
      }

      if (col.type === 'date' && value) {
        if (typeof value === 'number') {
          value = new Date((value - 25569) * 86400 * 1000).toISOString().split('T')[0];
        }
      }

      rowData[col.key] = value;
    });

    if (rowValid) {
      data.push(rowData);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data,
  };
};

export const generateMiningPlanTemplate = (): Blob => {
  const headers = ['行政区划代码', '行政区划名称', '计划开采量(万m³)', '含水层类型'];
  const sampleData = [
    ['110000', '北京市', 25000, '潜水含水层'],
    ['120000', '天津市', 18000, '承压含水层'],
    ['130000', '河北省', 45000, '潜水含水层'],
  ];

  const wsData = [headers, ...sampleData];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '开采计划');

  ws['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 25 },
    { wch: 30 },
  ];

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
