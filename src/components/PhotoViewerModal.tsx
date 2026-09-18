import React from "react";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { RekapEntry } from "../types";

interface PhotoViewerModalProps {
  photoUrl: string | null;
  entry: RekapEntry | null;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ photoUrl, entry, onClose }) => {
  const [zoom, setZoom] = React.useState<number>(1);
  const [rotation, setRotation] = React.useState<number>(0);

  if (!photoUrl || !entry) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `Foto_TRING_${entry.namaNasabah.replace(/\s+/g, "_")}_${entry.cif}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Bukti Foto TRING / Screenshot Aktivasi
            </h3>
            <p className="text-xs text-gray-500">
              Nasabah: <strong className="text-emerald-800">{entry.namaNasabah}</strong> ({entry.cif}) • {entry.produk}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
              title="Putar 90 Derajat"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Unduh Berkas Foto"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors ml-2"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image viewport */}
        <div className="relative flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4 min-h-[340px]">
          <img
            src={photoUrl}
            alt={`Foto TRING ${entry.namaNasabah}`}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.15s ease-out"
            }}
            className="max-h-[65vh] max-w-full object-contain rounded shadow-lg select-none"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-gray-50 text-xs text-gray-600 flex items-center justify-between border-t border-gray-100">
          <div>
            <span className="font-medium text-gray-700">Tanggal Transaksi:</span> {entry.tanggal}
            {entry.keterangan && <span className="ml-3 italic">({entry.keterangan})</span>}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
