import React from "react";
import { Download, Printer, Settings, RefreshCw, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { HeaderInfo } from "../types";
import pegadaianLogo from "../assets/images/pegadaian-logo.png";

interface NavbarProps {
  header: HeaderInfo;
  isSyncing: boolean;
  totalEntries: number;
  onOpenSettings: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  header,
  isSyncing,
  totalEntries,
  onOpenSettings,
  onExportExcel,
  onExportPdf,
  onPrint,
  onRefresh,
  onResetData,
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-emerald-900/10 shadow-xs sticky top-0 z-30 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo and Titles */}
          <div className="flex items-center gap-3">
            <div className="h-11 px-2 py-0.5 rounded-lg bg-white border border-emerald-100 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={pegadaianLogo}
                alt="Logo Resmi Pegadaian"
                className="h-full w-auto max-w-[120px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                  REKAP TRING AREA AMBON
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Real-time DB
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
                <span>Surat Edaran No. {header.nomorSurat} (Lampiran V)</span>
                <span>•</span>
                <span className="font-medium text-emerald-800">
                  CP {header.namaCabang} ({header.kodeCabang})
                </span>
                <span>•</span>
                <span>CRO: {header.namaCro} ({header.nikCro})</span>
                <span>•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs tracking-wide">
                  Signature : Made By Chello_Mtkhy
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-sync-refresh"
              onClick={onRefresh}
              title="Perbarui Sinkronisasi Real-time"
              className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            <button
              id="btn-header-settings"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-gray-600" />
              <span>Info Surat & Pejabat</span>
            </button>

            <button
              id="btn-export-excel"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ekspor Excel</span>
            </button>

            <button
              id="btn-export-pdf"
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ekspor PDF Resmi</span>
            </button>

            <button
              id="btn-print-doc"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
