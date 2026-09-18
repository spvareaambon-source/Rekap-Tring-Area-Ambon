import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HeaderInfo, RekapEntry } from "../types";
import { PEGADAIAN_LOGO_BASE64 } from "../assets/pegadaianLogoBase64";

export function formatIndoDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function exportToExcel(header: HeaderInfo, entries: RekapEntry[]) {
  const wsData: (string | number)[][] = [
    ["", "", "", "", "", "Lampiran V"],
    ["", "", "", "", "", "Surat Edaran"],
    ["", "", "", "", "", `Nomor : ${header.nomorSurat}`],
    ["", "", "", "", "", `Tanggal : ${header.tanggalSurat}`],
    [],
    ["", "", header.judulRekap],
    ["", "", header.subJudul],
    [],
    [`Nama CRO : ${header.namaCro}`],
    [`NIK : ${header.nikCro}`],
    [`Kode Cabang : ${header.kodeCabang}`],
    [`Nama Cabang : CP ${header.namaCabang}`],
    [],
    ["No", "Tanggal", "Nama Nasabah", "CIF", "Produk", "Keterangan"],
  ];

  entries.forEach((item, idx) => {
    wsData.push([
      idx + 1,
      item.tanggal,
      item.namaNasabah,
      item.cif,
      item.produk,
      item.keterangan || "Sukses"
    ]);
  });

  wsData.push(
    [],
    ["", "", "", "", "", `${header.kota}, ${formatIndoDate(header.tanggalLaporan)}`],
    ["", "Menyetujui", "", "", "Dibuat Oleh", ""],
    [],
    [],
    [],
    ["", `(${header.namaPemimpinCabang})`, "", "", `(${header.namaBpoPenjualan})`, ""],
    ["", `(${header.nikPemimpinCabang})`, "", "", `(${header.nikBpoPenjualan})`, ""],
    [],
    [header.catatan || "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah."]
  );

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [
    { wch: 6 },  // No
    { wch: 15 }, // Tanggal
    { wch: 30 }, // Nama Nasabah
    { wch: 20 }, // CIF
    { wch: 25 }, // Produk
    { wch: 30 }, // Keterangan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap TRING");

  const fileName = `Rekap_TRING_${header.namaCabang.replace(/\s+/g, "_")}_${header.tanggalLaporan || "export"}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportToPdf(header: HeaderInfo, entries: RekapEntry[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 14;

  // 1. Logo Resmi Pegadaian in top-left
  try {
    const logoW = 32; // mm
    const logoH = 18.6; // mm (aspect ratio 864x504 ~ 1.714)
    doc.addImage(PEGADAIAN_LOGO_BASE64, "PNG", 18, currentY - 2, logoW, logoH);
  } catch (err) {
    console.error("Gagal menambahkan logo Pegadaian ke PDF:", err);
  }

  // 2. Lampiran info in top right
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const rightMargin = pageWidth - 18;
  doc.text("Lampiran V", rightMargin, currentY, { align: "right" });
  doc.text("Surat Edaran", rightMargin, currentY + 4, { align: "right" });
  doc.text(`Nomor : ${header.nomorSurat}`, rightMargin, currentY + 8, { align: "right" });
  doc.text(`Tanggal : ${header.tanggalSurat}`, rightMargin, currentY + 12, { align: "right" });

  currentY += 25;

  // Title centered bold
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(header.judulRekap, pageWidth / 2, currentY, { align: "center" });
  doc.text(header.subJudul, pageWidth / 2, currentY + 5, { align: "center" });

  currentY += 14;

  // Header metadata block
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const leftX = 18;
  const valX = 48;

  doc.text("Nama CRO", leftX, currentY);
  doc.text(`:  ${header.namaCro || "-"}`, valX, currentY);

  doc.text("NIK", leftX, currentY + 4.5);
  doc.text(`:  ${header.nikCro || "-"}`, valX, currentY + 4.5);

  doc.text("Kode Cabang", leftX, currentY + 9);
  doc.text(`:  ${header.kodeCabang || "-"}`, valX, currentY + 9);

  doc.text("Nama Cabang", leftX, currentY + 13.5);
  doc.text(`:  CP ${header.namaCabang || "-"}`, valX, currentY + 13.5);

  currentY += 18;

  // Prepare table data matching official Surat Edaran
  const tableHead = [["No", "Tanggal", "Nama Nasabah", "CIF", "Produk"]];
  const tableBody = entries.map((item, idx) => [
    String(idx + 1),
    item.tanggal,
    item.namaNasabah,
    item.cif,
    item.produk
  ]);

  // If table is short, pad with empty rows up to 14 or 20 like in the PDF form
  const minRows = Math.max(14, entries.length);
  for (let i = entries.length; i < minRows; i++) {
    tableBody.push([String(i + 1), "", "", "", "Tabungan Emas"]);
  }

  // Draw autotable
  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    headStyles: {
      fillColor: [112, 173, 71], // Green matching official template
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 8.5,
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 40, 40],
      lineColor: [80, 80, 80],
      lineWidth: 0.15
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 26 },
      2: { halign: "left", cellWidth: 60 },
      3: { halign: "center", cellWidth: 38 },
      4: { halign: "center", cellWidth: 40 }
    },
    margin: { left: 18, right: 18 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we have room on current page for signatures
  let sigY = finalY;
  if (sigY > 230) {
    doc.addPage();
    sigY = 25;
  }

  // City & Date
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  const dateText = `${header.kota || "Ambon"}, ${formatIndoDate(header.tanggalLaporan)}`;
  doc.text(dateText, pageWidth - 25, sigY, { align: "right" });

  sigY += 6;

  // Menyetujui and Di buat Oleh
  const colLeft = 50;
  const colRight = pageWidth - 55;

  doc.setFont("helvetica", "normal");
  doc.text("Menyetujui", colLeft, sigY, { align: "center" });
  doc.text("Di buat Oleh", colRight, sigY, { align: "center" });

  sigY += 18;

  doc.text(`(${header.namaPemimpinCabang || "Nama Pemimpin Cabang"})`, colLeft, sigY, { align: "center" });
  doc.text(`(${header.namaBpoPenjualan || "Nama BPO Penjualan"})`, colRight, sigY, { align: "center" });

  sigY += 4.5;
  doc.text(`(${header.nikPemimpinCabang || "NIK"})`, colLeft, sigY, { align: "center" });
  doc.text(`(${header.nikBpoPenjualan || "NIK"})`, colRight, sigY, { align: "center" });

  sigY += 9;

  // Note
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.text(
    header.catatan || "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah.",
    18,
    sigY
  );

  // Add photo TRING proofs attachment pages: 1 foto TRING per lembar kertas, full kertas!
  const entriesWithPhoto = entries.filter((e) => Boolean(e.fotoTring));
  if (entriesWithPhoto.length > 0) {
    entriesWithPhoto.forEach((entry, idx) => {
      // 1 foto per lembar kertas baru
      doc.addPage();

      // Header Lampiran Bukti
      doc.setFillColor(248, 250, 252);
      doc.rect(10, 8, pageWidth - 20, 18, "F");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(10, 8, pageWidth - 20, 18, "S");

      // Small Pegadaian logo on left of photo sheet header
      try {
        doc.addImage(PEGADAIAN_LOGO_BASE64, "PNG", 13, 10, 19, 11);
      } catch {}

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("LAMPIRAN BUKTI FOTO TRING / SCREENSHOT AKTIVASI NASABAH", pageWidth / 2, 14, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(
        `Data #${idx + 1}  •  Nasabah: ${entry.namaNasabah}  •  CIF: ${entry.cif}  •  Tanggal: ${entry.tanggal}  •  Produk: ${entry.produk}`,
        pageWidth / 2,
        21,
        { align: "center" }
      );

      // Area Full Kertas untuk Foto
      const marginX = 10;
      const topY = 28;
      const maxW = pageWidth - (marginX * 2); // 190 mm
      const maxH = pageHeight - topY - 12;    // ~257 mm

      let imgFormat = "JPEG";
      if (entry.fotoTring!.includes("image/png")) {
        imgFormat = "PNG";
      } else if (entry.fotoTring!.includes("image/webp")) {
        imgFormat = "WEBP";
      }

      try {
        let renderW = maxW;
        let renderH = maxH;
        let posX = marginX;
        let posY = topY;

        // Try getting image aspect ratio to fit full paper without distortion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imgProps = (doc as any).getImageProperties(entry.fotoTring);
        if (imgProps && imgProps.width && imgProps.height) {
          const ratio = imgProps.width / imgProps.height;
          const containerRatio = maxW / maxH;

          if (ratio > containerRatio) {
            // Image is proportionally wider: use full available width
            renderW = maxW;
            renderH = maxW / ratio;
          } else {
            // Image is proportionally taller (e.g. smartphone screenshot): use full available height
            renderH = maxH;
            renderW = maxH * ratio;
          }

          // Center on page
          posX = (pageWidth - renderW) / 2;
          posY = topY + (maxH - renderH) / 2;
        }

        // Draw neat border frame for the photo
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(posX - 0.5, posY - 0.5, renderW + 1, renderH + 1, 1, 1, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(posX - 0.5, posY - 0.5, renderW + 1, renderH + 1, 1, 1, "S");

        doc.addImage(entry.fotoTring!, imgFormat, posX, posY, renderW, renderH);
      } catch (err) {
        console.warn("Falling back to direct addImage:", err);
        try {
          doc.addImage(entry.fotoTring!, imgFormat, marginX, topY, maxW, maxH);
        } catch {
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(220, 38, 38);
          doc.text("(Format gambar tidak didukung untuk dimasukkan otomatis)", pageWidth / 2, topY + 40, { align: "center" });
        }
      }

      // Footer Lembar Foto
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Lembar ${idx + 1} dari ${entriesWithPhoto.length}  |  CP ${header.namaCabang} (${header.kodeCabang})  |  Surat Edaran No. ${header.nomorSurat}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    });
  }

  const fileName = `Rekap_TRING_${header.namaCabang.replace(/\s+/g, "_")}_${header.tanggalLaporan || "export"}.pdf`;
  doc.save(fileName);
}
