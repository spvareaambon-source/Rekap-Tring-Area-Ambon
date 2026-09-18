import React, { useEffect, useState, useCallback, useRef } from "react";
import { HeaderInfo, RekapEntry } from "./types";
import {
  fetchRekapData,
  updateHeaderInfo,
  addRekapEntry,
  updateRekapEntry,
  deleteRekapEntry,
  resetRekapData,
} from "./api";
import { exportToExcel, exportToPdf } from "./utils/exportUtils";
import { Navbar } from "./components/Navbar";
import { InputEntryForm } from "./components/InputEntryForm";
import { RekapOfficialDoc } from "./components/RekapOfficialDoc";
import { PhotoViewerModal } from "./components/PhotoViewerModal";
import { HeaderSettingsModal } from "./components/HeaderSettingsModal";
import { EditEntryModal } from "./components/EditEntryModal";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

export default function App() {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo | null>(null);
  const [entries, setEntries] = useState<RekapEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Modals state
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; entry: RekapEntry } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<RekapEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, type: "success" | "info" | "error" = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsSyncing(true);

      const data = await fetchRekapData();
      setHeaderInfo(data.headerInfo);
      setEntries(data.entries || []);
      setErrorMsg("");
    } catch (err: any) {
      console.error("Error loading rekap data:", err);
      setErrorMsg(err.message || "Gagal menghubungkan ke database.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    // Periodic real-time poll every 6 seconds to keep multi-tab / server in sync
    const interval = setInterval(() => {
      loadData(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Add Entry
  const handleAddEntry = async (entryData: Omit<RekapEntry, "id" | "createdAt">) => {
    try {
      const created = await addRekapEntry(entryData);
      setEntries((prev) => [...prev, created]);
      showToast(`Baris No. ${entries.length + 1} (${created.namaNasabah}) berhasil ditambahkan ke database!`);
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan entry", "error");
      throw err;
    }
  };

  // Handle Edit Entry
  const handleSaveEditEntry = async (id: string, updated: Partial<RekapEntry>) => {
    try {
      const saved = await updateRekapEntry(id, updated);
      setEntries((prev) => prev.map((e) => (e.id === id ? saved : e)));
      showToast(`Data ${saved.namaNasabah} berhasil diperbarui.`);
    } catch (err: any) {
      showToast(err.message || "Gagal mengubah entry", "error");
      throw err;
    }
  };

  // Handle Delete Entry
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteRekapEntry(deleteConfirm.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteConfirm.id));
      showToast(`Data "${deleteConfirm.name}" telah dihapus dari tabel.`);
      setDeleteConfirm(null);
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus entry", "error");
    }
  };

  // Handle Update Header Info
  const handleSaveHeader = async (updated: Partial<HeaderInfo>) => {
    try {
      const newHeader = await updateHeaderInfo(updated);
      setHeaderInfo(newHeader);
      showToast("Informasi Surat Edaran dan Pejabat berhasil diperbarui.");
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui header", "error");
      throw err;
    }
  };

  // Handle Reset data
  const handleResetData = async () => {
    if (!window.confirm("Muat ulang data contoh standar sesuai Surat Edaran 121/SE/2026?")) {
      return;
    }
    try {
      setIsLoading(true);
      const data = await resetRekapData("seed");
      setHeaderInfo(data.headerInfo);
      setEntries(data.entries);
      showToast("Data berhasil dimuat ulang ke template standar.");
    } catch (err: any) {
      showToast(err.message || "Gagal mereset data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!headerInfo) return;
    try {
      exportToExcel(headerInfo, entries);
      showToast("Laporan Excel (.xlsx) berhasil diunduh!");
    } catch (err: any) {
      showToast("Gagal mengekspor Excel: " + err.message, "error");
    }
  };

  const handleExportPdf = () => {
    if (!headerInfo) return;
    try {
      exportToPdf(headerInfo, entries);
      showToast("Laporan PDF resmi (.pdf) berhasil dibuat & diunduh!");
    } catch (err: any) {
      showToast("Gagal mengekspor PDF: " + err.message, "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading && !headerInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
          <p className="text-sm font-semibold text-gray-700">Menghubungkan ke Database Rekapitulasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 print:hidden">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
              toastMsg.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : toastMsg.type === "info"
                ? "bg-blue-50 text-blue-800 border-blue-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-300"
            }`}
          >
            {toastMsg.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      {headerInfo && (
        <Navbar
          header={headerInfo}
          isSyncing={isSyncing}
          totalEntries={entries.length}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          onRefresh={() => loadData(false)}
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorMsg && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{errorMsg} (Menggunakan cadangan offline lokal).</span>
            </div>
            <button
              onClick={() => loadData(false)}
              className="px-3 py-1 bg-amber-200/70 hover:bg-amber-200 rounded font-semibold text-[11px]"
            >
              Coba Hubungkan Ulang
            </button>
          </div>
        )}

        {/* Input Form Section */}
        <InputEntryForm onAddEntry={handleAddEntry} totalRows={entries.length} />

        {/* Official Document View Table */}
        {headerInfo && (
          <RekapOfficialDoc
            header={headerInfo}
            entries={entries}
            onViewPhoto={(url, entry) => setSelectedPhoto({ url, entry })}
            onEditEntry={(entry) => setEditingEntry(entry)}
            onDeleteEntry={(id, name) => setDeleteConfirm({ id, name })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 border-t border-gray-200 bg-white text-center text-xs text-gray-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Rekapitulasi Aktivasi Akun TRING • Sesuai Format Surat Edaran No. 121/SE/2026 (Lampiran V)
          </p>
          <p className="font-medium text-emerald-800">
            Database Terintegrasi Real-time • Signature : Made By Chello_Mtkhy
          </p>
        </div>
      </footer>

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        photoUrl={selectedPhoto ? selectedPhoto.url : null}
        entry={selectedPhoto ? selectedPhoto.entry : null}
        onClose={() => setSelectedPhoto(null)}
      />

      {/* Header Info & Officers Settings Modal */}
      {headerInfo && (
        <HeaderSettingsModal
          header={headerInfo}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveHeader}
          onResetToTemplate={handleResetData}
        />
      )}

      {/* Edit Entry Modal */}
      <EditEntryModal
        entry={editingEntry}
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEditEntry}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-xs">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Hapus Data Rekapitulasi?</h4>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus data nasabah{" "}
              <strong className="text-gray-900">{deleteConfirm.name}</strong>? Tindakan ini akan menghapus baris dari rekapan dan database.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 font-medium text-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Hapus Baris
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
