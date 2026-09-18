import React, { useState } from "react";
import { HeaderInfo, RekapEntry } from "../types";
import { formatIndoDate } from "../utils/exportUtils";
import { Search, Eye, Trash2, Edit3, Image as ImageIcon, CheckCircle, FileText, LayoutGrid, AlertCircle } from "lucide-react";
import pegadaianLogo from "../assets/images/pegadaian-logo.png";

interface RekapOfficialDocProps {
  header: HeaderInfo;
  entries: RekapEntry[];
  onViewPhoto: (photoUrl: string, entry: RekapEntry) => void;
  onEditEntry: (entry: RekapEntry) => void;
  onDeleteEntry: (id: string, name: string) => void;
}

export const RekapOfficialDoc: React.FC<RekapOfficialDocProps> = ({
  header,
  entries,
  onViewPhoto,
  onEditEntry,
  onDeleteEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProduk, setSelectedProduk] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"official" | "interactive" | "photos">("official");

  // Filter entries
  const filteredEntries = entries.filter((item) => {
    const matchesSearch =
      item.namaNasabah.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tanggal.includes(searchTerm);

    const matchesProduk = selectedProduk === "ALL" || item.produk === selectedProduk;

    return matchesSearch && matchesProduk;
  });

  // Calculate statistics
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = entries.filter((e) => e.tanggal === todayStr).length;
  const withPhotoEntries = entries.filter((e) => Boolean(e.fotoTring));
  const withPhotoCount = withPhotoEntries.length;

  // For the official document view, pad with empty rows up to at least 14 or 20 like in the PDF template
  const minRows = Math.max(14, filteredEntries.length);
  const paddedRowsCount = Math.max(0, minRows - filteredEntries.length);

  return (
    <div id="rekap-container" className="space-y-4">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Nasabah Terisi</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">{entries.length}</span>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              Data Real-time
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Input Hari Ini</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{todayCount}</span>
            <span className="text-[11px] text-gray-500 font-mono">{todayStr}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Bukti Foto TRING</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-700">{withPhotoCount}</span>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              {entries.length > 0 ? `${Math.round((withPhotoCount / entries.length) * 100)}% Lengkap` : "0%"}
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Unit / Cabang</p>
          <div className="mt-1">
            <span className="text-sm font-bold text-gray-900 block truncate">CP {header.namaCabang}</span>
            <span className="text-[11px] text-gray-500 font-mono">Kode: {header.kodeCabang}</span>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-table"
              type="text"
              placeholder="Cari nama nasabah atau CIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            id="select-filter-produk"
            value={selectedProduk}
            onChange={(e) => setSelectedProduk(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Produk</option>
            <option value="Tabungan Emas">Tabungan Emas</option>
            <option value="Cicil Emas">Cicil Emas</option>
            <option value="Gadai Tabungan Emas">Gadai Tabungan Emas</option>
            <option value="Mulia">Mulia</option>
            <option value="Pembiayaan TRING">Pembiayaan TRING</option>
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("official")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "official"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Format Surat Edaran (Resmi)</span>
          </button>
          <button
            onClick={() => setViewMode("interactive")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "interactive"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tabel Interaktif</span>
          </button>
          <button
            onClick={() => setViewMode("photos")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "photos"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Lembar Foto ({withPhotoCount})</span>
          </button>
        </div>
      </div>

      {/* Screen Alert when Photos Tab is active */}
      {viewMode === "photos" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Mode Pratinjau Lembar Foto TRING</strong>: Menampilkan bukti foto dengan format 1 lembar kertas penuh untuk setiap 1 foto TRING. Siap cetak atau ekspor PDF.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
            Total {withPhotoCount} Lembar Foto
          </span>
        </div>
      )}

      {/* Official Paper Sheet Display (Matches Surat Edaran 121/SE/2026) */}
      <div
        id="official-doc-sheet"
        className={`bg-white rounded-xl border border-gray-300 shadow-sm p-6 md:p-10 max-w-5xl mx-auto font-sans print:border-none print:shadow-none print:p-0 print:m-0 ${
          viewMode === "photos" ? "hidden print:block" : "block"
        }`}
      >
        {/* Surat Edaran Header with Logo */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center">
            <img
              src={pegadaianLogo}
              alt="Logo Resmi Pegadaian"
              className="h-16 md:h-20 w-auto max-w-[220px] object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-right text-[11px] text-gray-700 leading-tight">
            <div className="font-semibold">{header.lampiran || "Lampiran V"}</div>
            <div>Surat Edaran</div>
            <div>Nomor : {header.nomorSurat}</div>
            <div>Tanggal : {header.tanggalSurat}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xs md:text-sm lg:text-base font-extrabold text-gray-900 tracking-wider uppercase leading-snug">
            {header.judulRekap}
          </h2>
          <h3 className="text-xs md:text-sm lg:text-[13px] font-bold text-gray-800 tracking-wide uppercase mt-1 leading-normal text-emerald-950">
            {header.subJudul}
          </h3>
        </div>

        {/* Metadata section */}
        <div className="text-xs text-gray-800 mb-5 max-w-sm space-y-1">
          <div className="grid grid-cols-[100px_10px_1fr] items-center">
            <span className="font-medium">Nama CRO</span>
            <span>:</span>
            <span className="font-semibold">{header.namaCro || "-"}</span>
          </div>
          <div className="grid grid-cols-[100px_10px_1fr] items-center">
            <span className="font-medium">NIK</span>
            <span>:</span>
            <span>{header.nikCro || "-"}</span>
          </div>
          <div className="grid grid-cols-[100px_10px_1fr] items-center">
            <span className="font-medium">Kode Cabang</span>
            <span>:</span>
            <span>{header.kodeCabang || "-"}</span>
          </div>
          <div className="grid grid-cols-[100px_10px_1fr] items-center">
            <span className="font-medium">Nama Cabang</span>
            <span>:</span>
            <span className="font-semibold">CP {header.namaCabang || "-"}</span>
          </div>
        </div>

        {/* Main Table Matching Official Surat Edaran */}
        <div className="overflow-x-auto border border-gray-800 mb-6">
          <table className="w-full border-collapse text-xs text-gray-900">
            <thead>
              <tr className="bg-[#70ad47] text-white border-b border-gray-800">
                <th className="py-2 px-2 border-r border-gray-800 text-center font-bold w-10">No</th>
                <th className="py-2 px-3 border-r border-gray-800 text-center font-bold w-28">Tanggal</th>
                <th className="py-2 px-4 border-r border-gray-800 text-center font-bold">Nama Nasabah</th>
                <th className="py-2 px-3 border-r border-gray-800 text-center font-bold w-36">CIF</th>
                <th className="py-2 px-3 border-r border-gray-800 text-center font-bold w-44">Produk</th>
                <th className="py-2 px-2 text-center font-bold w-24 print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-800 hover:bg-emerald-50/40 transition-colors"
                >
                  <td className="py-2 px-2 border-r border-gray-800 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-800 text-center whitespace-nowrap font-mono text-[11px]">
                    {entry.tanggal}
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800 font-semibold text-gray-900">
                    <div className="flex items-center justify-between gap-2">
                      <span>{entry.namaNasabah}</span>
                      {entry.fotoTring && (
                        <button
                          type="button"
                          onClick={() => onViewPhoto(entry.fotoTring!, entry)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors print:hidden shrink-0"
                          title="Lihat Bukti Foto TRING"
                        >
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          <span>Foto TRING</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 border-r border-gray-800 text-center font-mono text-[11px]">
                    {entry.cif}
                  </td>
                  <td className="py-2 px-3 border-r border-gray-800 text-center font-medium">
                    {entry.produk}
                  </td>
                  <td className="py-1.5 px-2 text-center print:hidden">
                    <div className="flex items-center justify-center gap-1">
                      {entry.fotoTring && (
                        <button
                          onClick={() => onViewPhoto(entry.fotoTring!, entry)}
                          className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                          title="Lihat Bukti Foto TRING"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="p-1 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        title="Ubah baris data"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id, entry.namaNasabah)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus baris data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Pad remaining rows to look identical to template blank slots */}
              {Array.from({ length: paddedRowsCount }).map((_, idx) => {
                const rowNo = filteredEntries.length + idx + 1;
                return (
                  <tr key={`empty-${idx}`} className="border-b border-gray-800 text-gray-400 h-8">
                    <td className="py-2 px-2 border-r border-gray-800 text-center font-medium">
                      {rowNo}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-800 text-center"></td>
                    <td className="py-2 px-4 border-r border-gray-800"></td>
                    <td className="py-2 px-3 border-r border-gray-800 text-center"></td>
                    <td className="py-2 px-3 border-r border-gray-800 text-center text-gray-600">
                      Tabungan Emas
                    </td>
                    <td className="py-2 px-2 text-center print:hidden"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Signature Section matching PDF exact layout */}
        <div className="mt-8 space-y-6 text-xs text-gray-900">
          {/* Location & Date */}
          <div className="text-right font-medium text-gray-800">
            {header.kota || "Ambon"}, {formatIndoDate(header.tanggalLaporan)}
          </div>

          {/* Menyetujui and Di buat Oleh */}
          <div className="grid grid-cols-2 gap-12 pt-2 text-center">
            <div>
              <p className="font-semibold text-gray-800">Menyetujui</p>
              <div className="h-16"></div>
              <p className="font-bold underline">({header.namaPemimpinCabang || "Nama Pemimpin Cabang"})</p>
              <p className="text-[11px] text-gray-600">({header.nikPemimpinCabang || "NIK"})</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">Di buat Oleh</p>
              <div className="h-16"></div>
              <p className="font-bold underline">({header.namaBpoPenjualan || "Nama BPO Penjualan"})</p>
              <p className="text-[11px] text-gray-600">({header.nikBpoPenjualan || "NIK"})</p>
            </div>
          </div>

          {/* Note */}
          <div className="pt-2 text-[11px] text-gray-700 italic border-t border-dashed border-gray-200">
            {header.catatan || "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah."}
          </div>
        </div>
      </div>

      {/* Empty State when in Photos View Mode and no photos uploaded */}
      {viewMode === "photos" && withPhotoCount === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-2xl mx-auto shadow-sm print:hidden">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Belum Ada Bukti Foto TRING</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Silakan unggah foto TRING / tangkapan layar aktivasi melalui formulir input atau klik tombol edit pada data nasabah.
          </p>
        </div>
      )}

      {/* Printable Full-Paper Photo Sheets (1 Foto TRING per 1 Lembar Kertas Penuh) */}
      {withPhotoEntries.map((entry, idx, arr) => (
        <div
          key={`tring-photo-sheet-${entry.id}`}
          className={`tring-full-paper-sheet ${
            viewMode === "photos"
              ? "flex flex-col bg-white rounded-xl border border-gray-300 shadow-sm p-6 md:p-8 max-w-4xl mx-auto my-6"
              : "hidden print:flex"
          }`}
        >
          {/* Header Lembar Kertas */}
          <div className="border-b border-gray-300 pb-3 mb-3 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase tracking-wide mb-1">
              <span>Lembar Bukti #{idx + 1} dari {arr.length}</span>
              <span>&bull;</span>
              <span>1 Foto Per Lembar Kertas</span>
            </div>
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-900">
              LAMPIRAN BUKTI FOTO TRING / SCREENSHOT AKTIVASI NASABAH
            </h3>
            <p className="text-[11px] md:text-xs text-gray-700 font-medium mt-1">
              Nasabah: <strong className="text-emerald-950 font-bold">{entry.namaNasabah}</strong> &bull; CIF: <span className="font-mono font-semibold">{entry.cif}</span> &bull; Tanggal: {entry.tanggal} &bull; Produk: {entry.produk}
            </p>
          </div>

          {/* Full Paper Photo Viewport */}
          <div className="tring-full-paper-img-wrapper flex-1 flex items-center justify-center p-2 min-h-[460px] print:min-h-0">
            <img
              src={entry.fotoTring}
              alt={`Bukti TRING ${entry.namaNasabah}`}
              className="tring-full-paper-img rounded-lg border border-gray-200 shadow-md max-h-[72vh] print:max-h-[82vh] max-w-full object-contain cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => onViewPhoto(entry.fotoTring!, entry)}
              title="Klik untuk membuka jendela zoom / unduh berkas"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Footer Lembar Kertas */}
          <div className="mt-3 pt-2.5 border-t border-gray-300 flex items-center justify-between text-[10px] md:text-[11px] text-gray-500">
            <span>CP {header.namaCabang} ({header.kodeCabang})</span>
            <span className="font-semibold text-emerald-900">Surat Edaran No. {header.nomorSurat}</span>
            <span>Lembar Lampiran #{idx + 1} dari {arr.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
