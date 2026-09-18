import React, { useState, useRef } from "react";
import { PlusCircle, UploadCloud, X, Image as ImageIcon, CheckCircle2, AlertCircle, Camera, Loader2 } from "lucide-react";
import { PRODUK_OPTIONS, RekapEntry } from "../types";
import { compressImage } from "../utils/imageUtils";

interface InputEntryFormProps {
  onAddEntry: (entry: Omit<RekapEntry, "id" | "createdAt">) => Promise<void>;
  totalRows: number;
}

export const InputEntryForm: React.FC<InputEntryFormProps> = ({ onAddEntry, totalRows }) => {
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [namaNasabah, setNamaNasabah] = useState<string>("");
  const [cif, setCif] = useState<string>("");
  const [produk, setProduk] = useState<string>("Tabungan Emas");
  const [keterangan, setKeterangan] = useState<string>("Aktivasi Akun Premium TRING Sukses");
  const [fotoTring, setFotoTring] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg("");
      setFileName(file.name);
      const compressed = await compressImage(file, 1200, 0.85);
      setFotoTring(compressed);
    } catch (err: any) {
      setErrorMsg("Gagal memproses foto TRING: " + (err.message || "format tidak didukung"));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap unggah berkas gambar (JPG, PNG, WebP).");
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMsg("");
      setFileName(file.name);
      const compressed = await compressImage(file, 1200, 0.85);
      setFotoTring(compressed);
    } catch (err: any) {
      setErrorMsg("Gagal memproses foto: " + (err.message || "format tidak didukung"));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFotoTring("");
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!namaNasabah.trim()) {
      setErrorMsg("Nama Nasabah wajib diisi.");
      return;
    }
    if (!cif.trim()) {
      setErrorMsg("Nomor CIF wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddEntry({
        tanggal,
        namaNasabah: namaNasabah.trim(),
        cif: cif.trim(),
        produk,
        fotoTring,
        keterangan: keterangan.trim()
      });

      setSuccessMsg(`Data nasabah "${namaNasabah}" berhasil ditambahkan ke baris rekapitulasi!`);
      // Reset input fields for next entry
      setNamaNasabah("");
      setCif("");
      setFotoTring("");
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Auto dismiss success notice after 4 seconds
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="form-input-card" className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 print:hidden">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
              +
            </span>
            Form Input Data Aktivasi Nasabah (TRING)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Input akan otomatis terisi ke baris No. <strong className="text-emerald-700 font-semibold">{totalRows + 1}</strong> pada tabel rekapan secara real-time.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Tanggal */}
          <div>
            <label htmlFor="input-tanggal" className="block text-xs font-semibold text-gray-700 mb-1">
              Tanggal Input <span className="text-red-500">*</span>
            </label>
            <input
              id="input-tanggal"
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Nama Nasabah */}
          <div className="md:col-span-2">
            <label htmlFor="input-nama-nasabah" className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap Nasabah <span className="text-red-500">*</span>
            </label>
            <input
              id="input-nama-nasabah"
              type="text"
              placeholder="Contoh: Siti Rahmawati"
              value={namaNasabah}
              onChange={(e) => setNamaNasabah(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* CIF */}
          <div>
            <label htmlFor="input-cif" className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor CIF <span className="text-red-500">*</span>
            </label>
            <input
              id="input-cif"
              type="text"
              placeholder="Contoh: CIF-10982736"
              value={cif}
              onChange={(e) => setCif(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Produk */}
          <div>
            <label htmlFor="input-produk" className="block text-xs font-semibold text-gray-700 mb-1">
              Produk Terpilih
            </label>
            <select
              id="input-produk"
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
            >
              {PRODUK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label htmlFor="input-keterangan" className="block text-xs font-semibold text-gray-700 mb-1">
              Keterangan Tambahan (Opsional)
            </label>
            <input
              id="input-keterangan"
              type="text"
              placeholder="Contoh: Aktivasi Akun Premium Sukses"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Upload Foto TRING / Bukti Screenshot Sukses */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              Upload Foto TRING / Screenshot Bukti Sukses TRING
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              Sesuai catatan edaran: bukti visual sukses aplikasi
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {!fotoTring ? (
            <div
              id="dropzone-foto-tring"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg p-3.5 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-1.5"
            >
              {isCompressing ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengoptimalkan foto TRING...</span>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-emerald-700 hover:underline">Klik untuk pilih foto</span> atau tarik berkas screenshot ke sini
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Format: JPG, PNG, WEBP (Kamera ponsel didukung langsung)
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={fotoTring}
                  alt="Foto TRING Preview"
                  className="w-12 h-12 rounded object-cover border border-emerald-300 shadow-2xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-900 truncate">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{fileName || "Foto TRING terlampir"}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Foto siap dilampirkan ke baris tabel & laporan berkala
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1.5 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors shrink-0"
                title="Hapus foto ini"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit action */}
        <div className="flex justify-end pt-1">
          <button
            id="btn-submit-entry"
            type="submit"
            disabled={isSubmitting || isCompressing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Masukkan ke Baris Rekapan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
