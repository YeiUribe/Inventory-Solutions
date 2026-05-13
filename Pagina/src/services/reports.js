import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';

export const generatePDFReport = (inventoryData) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("Reporte de Inventario Tecnológico", 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);
  
  let y = 40;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ID", 14, y);
  doc.text("Dispositivo", 35, y);
  doc.text("Categoría", 90, y);
  doc.text("Estado", 130, y);
  doc.text("Stock", 170, y);
  
  y += 6;
  doc.setFont("helvetica", "normal");
  
  inventoryData.forEach(item => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.id.toString(), 14, y);
    doc.text(item.device, 35, y);
    doc.text(item.category, 90, y);
    doc.text(item.status, 130, y);
    doc.text(item.stock.toString(), 170, y);
    y += 8;
  });
  
  doc.save("Reporte_Inventario_PPI.pdf");
};

export const generateExcelReport = (inventoryData) => {
  const rows = inventoryData.map(item => ({
    "Activo fijo": item.id,
    "Serial": item.serial || '-',
    "Equipo": item.device,
    "Tipo": item.category,
    "Estado": item.status,
    "Responsable": item.responsible || '-',
    "Última asignación": item.date || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
  
  XLSX.writeFile(workbook, "Reporte_Inventario_PPI.xlsx");
};
