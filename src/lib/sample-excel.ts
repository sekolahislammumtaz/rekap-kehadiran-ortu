import * as XLSX from "xlsx";

export function generateSampleExcelBuffer(): Buffer {
  const sampleData = [
    {
      "Nama Peserta": "Ayah Ahmad Fauzi",
      "Divisi": "SD IT Mumtaz",
      "Status Kehadiran": "Hadir",
    },
    {
      "Nama Peserta": "Bunda Ahmad Fauzi",
      "Divisi": "SD IT Mumtaz",
      "Status Kehadiran": "Hadir",
    },
    {
      "Nama Peserta": "Ayah Fatimah Az-Zahra",
      "Divisi": "TK Mumtaz",
      "Status Kehadiran": "Belum Hadir",
    },
    {
      "Nama Peserta": "Bunda Fatimah Az-Zahra",
      "Divisi": "TK Mumtaz",
      "Status Kehadiran": "Hadir",
    },
    {
      "Nama Peserta": "Ayah Rayhan Pratama",
      "Divisi": "SMP IT Mumtaz",
      "Status Kehadiran": "Belum Hadir",
    },
    {
      "Nama Peserta": "Bunda Rayhan Pratama",
      "Divisi": "SMP IT Mumtaz",
      "Status Kehadiran": "Belum Hadir",
    },
    {
      "Nama Peserta": "Ayah Aisha Nabila",
      "Divisi": "SMA IT Mumtaz",
      "Status Kehadiran": "Hadir",
    },
    {
      "Nama Peserta": "Bunda Aisha Nabila",
      "Divisi": "SMA IT Mumtaz",
      "Status Kehadiran": "Belum Hadir",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet["!cols"] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Format Kehadiran");

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}
