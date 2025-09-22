import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Normalize rows based on provided column definitions
// rows: Array<object>
// columns: Array<{ field: string, headerName?: string }>
export function normalize(rows, columns) {
  if (!rows || rows.length === 0) return [];
  if (!columns || columns.length === 0) return rows;

  return rows.map((row) => {
    const out = {};
    columns.forEach((col) => {
      const key = col.headerName || col.field;
      out[key] = row[col.field];
    });
    return out;
  });
}

export function exportToCSV(filename, rows, columns) {
  const data = normalize(rows, columns);
  const csv = Papa.unparse(data || []);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportToJSON(filename, rows, columns) {
  const data = normalize(rows, columns);
  const blob = new Blob([JSON.stringify(data || [], null, 2)], { type: 'application/json' });
  saveAs(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

export function exportToExcel(filename, rows, columns) {
  const data = normalize(rows, columns);
  const worksheet = XLSX.utils.json_to_sheet(data || []);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function exportToPDF(filename, rows, columns, options = {}) {
  const data = normalize(rows, columns);
  const doc = new jsPDF({ orientation: options.orientation || 'p', unit: 'pt', format: 'a4' });

  const headers = data.length > 0
    ? Object.keys(data[0])
    : (columns || []).map((c) => c.headerName || c.field);

  const body = (data || []).map((r) => headers.map((h) => r[h]));

  // Header block
  let y = 40;
  if (options.title) {
    doc.setFontSize(16);
    doc.text(options.title, 40, y);
    y += 18;
  }
  if (Array.isArray(options.headerLines)) {
    doc.setFontSize(10);
    options.headerLines.forEach((line) => {
      doc.text(String(line), 40, y);
      y += 14;
    });
  }

  autoTable(doc, {
    head: [headers],
    body,
    startY: Math.max(y, options.startY || 60),
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: [25, 118, 210] },
    margin: { left: 20, right: 20 },
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}


