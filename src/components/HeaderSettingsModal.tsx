import React, { useState } from "react";
import { X, Save, AlertCircle, RotateCcw } from "lucide-react";
import { HeaderInfo } from "../types";

interface HeaderSettingsModalProps {
  header: HeaderInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<HeaderInfo>) => Promise<void>;
  onResetToTemplate: () => void;
}

export const HeaderSettingsModal: React.FC<HeaderSettingsModalProps> = ({
  header,
  isOpen,
  onClose,
  onSave,
  onResetToTemplate,
}) => {
  const [formData, setFormData] = useState<HeaderInfo>({ ...header });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (field: keyof HeaderInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg("");
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-800 text-white">
          <div>
            <h3 className="text-base font-bold">
              Konfigurasi Surat Edaran & Pejabat Penandatangan
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Sesuaikan identitas kantor cabang, CRO, dan pejabat sesuai surat dinas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Section: Judul Rekapitulasi */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
              1. Judul Laporan Rekapitulasi
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Judul Utama</label>
                <input
                  type="text"
                  value={formData.judulRekap}
                  onChange={(e) => handleChange("judulRekap", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sub Judul</label>
                <input
                  type="text"
                  value={formData.subJudul}
                  onChange={(e) => handleChange("subJudul", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section: Rujukan Surat Edaran */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
              2. Rujukan Surat Edaran
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lampiran</label>
                <input
                  type="text"
                  value={formData.lampiran}
                  onChange={(e) => handleChange("lampiran", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nomor Surat</label>
                <input
                  type="text"
                  value={formData.nomorSurat}
                  onChange={(e) => handleChange("nomorSurat", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tanggal Surat</label>
                <input
                  type="text"
                  value={formData.tanggalSurat}
                  onChange={(e) => handleChange("tanggalSurat", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Identitas CRO & Cabang */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
              3. Data CRO & Cabang Pengelola
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama CRO</label>
                <input
                  type="text"
                  value={formData.namaCro}
                  onChange={(e) => handleChange("namaCro", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIK CRO</label>
                <input
                  type="text"
                  value={formData.nikCro}
                  onChange={(e) => handleChange("nikCro", e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kode Cabang</label>
                <input
                  type="text"
                  value={formData.kodeCabang}
                  onChange={(e) => handleChange("kodeCabang", e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Cabang (CP ...)</label>
                <input
                  type="text"
                  value={formData.namaCabang}
                  onChange={(e) => handleChange("namaCabang", e.target.value)}
                  placeholder="Ambon"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Pejabat Penandatangan */}
          <div>
            <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">
              4. Pejabat Penandatangan Laporan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kota Laporan</label>
                <input
                  type="text"
                  value={formData.kota}
                  onChange={(e) => handleChange("kota", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tanggal Rekapan Laporan</label>
                <input
                  type="date"
                  value={formData.tanggalLaporan}
                  onChange={(e) => handleChange("tanggalLaporan", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Pemimpin Cabang</label>
                <input
                  type="text"
                  value={formData.namaPemimpinCabang}
                  onChange={(e) => handleChange("namaPemimpinCabang", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIK Pemimpin Cabang</label>
                <input
                  type="text"
                  value={formData.nikPemimpinCabang}
                  onChange={(e) => handleChange("nikPemimpinCabang", e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama BPO Penjualan</label>
                <input
                  type="text"
                  value={formData.namaBpoPenjualan}
                  onChange={(e) => handleChange("namaBpoPenjualan", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">NIK BPO Penjualan</label>
                <input
                  type="text"
                  value={formData.nikBpoPenjualan}
                  onChange={(e) => handleChange("nikBpoPenjualan", e.target.value)}
                  className="w-full px-3 py-2 font-mono rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onResetToTemplate}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Template Standar</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
