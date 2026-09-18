import React, { useState, useRef } from "react";
import { X, Save, UploadCloud, Image as ImageIcon, Camera, Loader2, AlertCircle } from "lucide-react";
import { PRODUK_OPTIONS, RekapEntry } from "../types";
import { compressImage } from "../utils/imageUtils";

interface EditEntryModalProps {
  entry: RekapEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updated: Partial<RekapEntry>) => Promise<void>;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !entry) return null;

  const [tanggal, setTanggal] = useState(entry.tanggal);
  const [namaNasabah, setNamaNasabah] = useState(entry.namaNasabah);
  const [cif, setCif] = useState(entry.cif);
  const [produk, setProduk] = useState(entry.produk);
  const [keterangan, setKeterangan] = useState(entry.keterangan || "");
  const [fotoTring, setFotoTring] = useState(entry.fotoTring || "");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg("");
      const compressed = await compressImage(file, 1200, 0.85);
      setFotoTring(compressed);
    } catch (err: any) {
      setErrorMsg("Gagal memproses foto TRING: " + (err.message || ""));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaNasabah.trim()) {
      setErrorMsg("Nama Nasabah wajib diisi.");
      return;
    }
    if (!cif.trim()) {
      setErrorMsg("CIF wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");
      await onSave(entry.id, {
        tanggal,
        namaNasabah: namaNasabah.trim(),
        cif: cif.trim(),
        produk,
        fotoTring,
        keterangan: keterangan.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memperbarui data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-emerald-800 text-white">
          <div>
            <h3 className="text-sm font-bold">Edit Baris Data Nasabah</h3>
            <p className="text-xs text-emerald-100 mt-0.5">Perbarui informasi nasabah atau ganti foto TRING</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nama Nasabah</label>
            <input
              type="text"
              value={namaNasabah}
              onChange={(e) => setNamaNasabah(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nomor CIF</label>
            <input
              type="text"
              value={cif}
              onChange={(e) => setCif(e.target.value)}
              required
              className="w-full px-3 py-2 font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Produk</label>
            <select
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              {PRODUK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Keterangan</label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Foto TRING Section */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
              <span>Foto TRING / Bukti Screenshot Sukses</span>
              {fotoTring && (
                <button
                  type="button"
                  onClick={() => setFotoTring("")}
                  className="text-red-600 hover:underline font-normal text-[11px]"
                >
                  Hapus Foto
                </button>
              )}
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {fotoTring ? (
              <div className="flex items-center gap-3 p-2.5 border border-emerald-200 bg-emerald-50/40 rounded-lg">
                <img
                  src={fotoTring}
                  alt="Foto TRING"
                  className="w-12 h-12 object-cover rounded border border-emerald-300 shadow-2xs"
                />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900 text-xs">Foto TRING Terlampir</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-emerald-700 underline hover:text-emerald-900 mt-0.5"
                  >
                    Ganti dengan foto lain
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="w-full border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-lg p-3 text-center bg-gray-50 flex items-center justify-center gap-2 text-gray-600 hover:text-emerald-700 transition-colors"
              >
                {isCompressing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                )}
                <span>{isCompressing ? "Memproses gambar..." : "Unggah Foto TRING"}</span>
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Menyimpan..." : "Perbarui Data"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
