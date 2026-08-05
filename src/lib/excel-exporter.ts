import * as XLSX from "xlsx";

export interface RecapExportItem {
  no: number;
  namaSiswa: string;
  divisi: string;
  poinKehadiran: number;
  daftarKajian: string;
  detailKehadiran: string;
}

export function generateRecapExcelBuffer(
  items: RecapExportItem[],
  divisionName: string = "Semua Divisi"
): Buffer {
  const worksheetData = items.map((item) => ({
    "No": item.no,
    "Nama Siswa": item.namaSiswa,
    "Divisi": item.divisi,
    "Poin Kehadiran": item.poinKehadiran,
    "Daftar Nama Kajian": item.daftarKajian,
    "Detail Riwayat": item.detailKehadiran,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths for nice appearance
  worksheet["!cols"] = [
    { wch: 6 },  // No
    { wch: 30 }, // Nama Siswa
    { wch: 20 }, // Divisi
    { wch: 16 }, // Poin Kehadiran
    { wch: 45 }, // Daftar Nama Kajian
    { wch: 50 }, // Detail Riwayat
  ];

  const workbook = XLSX.utils.book_new();
  const sheetName = (divisionName.replace(/[\\/?*:[\]]/g, "_") || "Rekap").substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return excelBuffer;
}
