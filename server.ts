import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface RekapEntry {
  id: string;
  tanggal: string;
  namaNasabah: string;
  cif: string;
  produk: string;
  fotoTring?: string; // Data URL / Base64 image
  keterangan?: string;
  createdAt: string;
}

interface HeaderInfo {
  lampiran: string;
  nomorSurat: string;
  tanggalSurat: string;
  judulRekap: string;
  subJudul: string;
  namaCro: string;
  nikCro: string;
  kodeCabang: string;
  namaCabang: string;
  kota: string;
  tanggalLaporan: string;
  namaPemimpinCabang: string;
  nikPemimpinCabang: string;
  namaBpoPenjualan: string;
  nikBpoPenjualan: string;
  namaKadiv: string;
  nikKadiv: string;
  catatan: string;
}

interface DatabaseSchema {
  headerInfo: HeaderInfo;
  entries: RekapEntry[];
}

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidImageDataUrl(value?: string): boolean {
  if (!value) return true;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(value.trim());
}

const DEFAULT_HEADER: HeaderInfo = {
  lampiran: "Lampiran V",
  nomorSurat: "121/SE/2026",
  tanggalSurat: "24 Agustus 2023",
  judulRekap: "REKAPITULASI AKTIVASI REK TABUNGAN EMAS PRE AKTIF VIA TRING",
  subJudul: "DENGAN MINIMAL TRANSAKSI RP100.000",
  namaCro: "Rian Pratama",
  nikCro: "P.88210",
  kodeCabang: "11169",
  namaCabang: "CP AMBON",
  kota: "Ambon",
  tanggalLaporan: getLocalDateString(),
  namaPemimpinCabang: "Ahmad Fauzi, S.E.",
  nikPemimpinCabang: "P.65432",
  namaBpoPenjualan: "Budi Santoso",
  nikBpoPenjualan: "P.71098",
  namaKadiv: "Ketut Suhardiono",
  nikKadiv: "NIK P.79002",
  catatan: "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah."
};

const DEFAULT_ENTRIES: RekapEntry[] = [
  {
    id: "entry-1",
    tanggal: "2023-08-25",
    namaNasabah: "Siti Rahmawati",
    cif: "CIF-10982736",
    produk: "Tabungan Emas",
    fotoTring: "",
    keterangan: "Aktivasi Akun Premium TRING Sukses",
    createdAt: new Date().toISOString()
  },
  {
    id: "entry-2",
    tanggal: "2023-08-25",
    namaNasabah: "Hendrik Pattiruhu",
    cif: "CIF-10982745",
    produk: "Tabungan Emas",
    fotoTring: "",
    keterangan: "Aktivasi Akun Premium TRING Sukses",
    createdAt: new Date().toISOString()
  },
  {
    id: "entry-3",
    tanggal: "2023-08-26",
    namaNasabah: "Maria Soumokil",
    cif: "CIF-10982811",
    produk: "Tabungan Emas",
    fotoTring: "",
    keterangan: "Verifikasi Berhasil",
    createdAt: new Date().toISOString()
  },
  {
    id: "entry-4",
    tanggal: "2023-08-26",
    namaNasabah: "Joko Supriyanto",
    cif: "CIF-10982902",
    produk: "Tabungan Emas",
    fotoTring: "",
    keterangan: "Aktivasi Akun Premium Sukses",
    createdAt: new Date().toISOString()
  },
  {
    id: "entry-5",
    tanggal: "2023-08-27",
    namaNasabah: "Grace Latumahina",
    cif: "CIF-10983054",
    produk: "Tabungan Emas",
    fotoTring: "",
    keterangan: "Aktivasi TRING Berhasil",
    createdAt: new Date().toISOString()
  }
];

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "rekap_data.json");

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        headerInfo: DEFAULT_HEADER,
        entries: DEFAULT_ENTRIES
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content) as DatabaseSchema;

    // Migrate any legacy PDS/PSDS mentions to TRING and normalize legacy cabang name
    let modified = false;
    const ALLOWED_CABANG = ["CP AMBON", "CP NUSANIWE", "CP PASSO", "CP MASOHI", "CP TUAL", "CPS AMBON"];
    const normalizeCabang = (val?: string) => {
      const upper = (val || "").trim().toUpperCase();
      if (!upper) return "CP AMBON";
      if (ALLOWED_CABANG.includes(upper)) return upper;
      const stripped = upper.replace(/^CP\s+/, "");
      return ALLOWED_CABANG.find((c) => c === `CP ${stripped}` || c === stripped) || "CP AMBON";
    };

    if (parsed.headerInfo) {
      const normalizedCabang = normalizeCabang(parsed.headerInfo.namaCabang);
      if (parsed.headerInfo.namaCabang !== normalizedCabang) {
        parsed.headerInfo.namaCabang = normalizedCabang;
        modified = true;
      }
    }

    if (parsed.headerInfo?.subJudul?.includes("PDS / PSDS") || parsed.headerInfo?.subJudul?.includes("PDS/PSDS")) {
      parsed.headerInfo.subJudul = "TRING HASIL PROSPEK CRO";
      modified = true;
    }
    if (parsed.headerInfo?.catatan?.includes("PDS atau PSDS")) {
      parsed.headerInfo.catatan = parsed.headerInfo.catatan.replace("PDS atau PSDS", "TRING");
      modified = true;
    }
    if (Array.isArray(parsed.entries)) {
      parsed.entries.forEach(e => {
        if (e.keterangan && (e.keterangan.includes("PDS") || e.keterangan.includes("PSDS"))) {
          e.keterangan = e.keterangan.replace(/PDS\s*\/\s*PSDS/g, "TRING").replace(/PSDS/g, "TRING").replace(/PDS/g, "TRING");
          modified = true;
        }
        if (e.produk && (e.produk.includes("PDS") || e.produk.includes("PSDS"))) {
          e.produk = e.produk.replace(/PDS\s*\/\s*PSDS/g, "TRING").replace(/PSDS/g, "TRING").replace(/PDS/g, "TRING");
          modified = true;
        }
      });
    }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }

    return parsed;
  } catch (err) {
    console.error("Error reading database file, returning fallback:", err);
    return { headerInfo: DEFAULT_HEADER, entries: DEFAULT_ENTRIES };
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Initialize DB
  ensureDbFile();

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get full rekap data
  app.get("/api/rekap", (_req, res) => {
    try {
      const data = ensureDbFile();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch rekap data", details: err.message });
    }
  });

  // Update header info
  app.put("/api/rekap/header", (req, res) => {
    try {
      const ALLOWED_CABANG = ["CP AMBON", "CP NUSANIWE", "CP PASSO", "CP MASOHI", "CP TUAL", "CPS AMBON"];
      const currentData = ensureDbFile();
      const incoming = { ...req.body };
      if (typeof incoming.namaCabang === "string") {
        const upper = incoming.namaCabang.trim().toUpperCase();
        if (!ALLOWED_CABANG.includes(upper)) {
          return res.status(400).json({ error: "Pilihan cabang tidak valid. Pilih dari daftar CP/CPS Area Ambon." });
        }
        incoming.namaCabang = upper;
      }
      currentData.headerInfo = {
        ...currentData.headerInfo,
        ...incoming
      };
      saveDb(currentData);
      res.json({ success: true, headerInfo: currentData.headerInfo });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update header info", details: err.message });
    }
  });

  // Add new entry
  app.post("/api/rekap/entries", (req, res) => {
    try {
      const { tanggal, namaNasabah, cif, produk, fotoTring, keterangan } = req.body || {};
      const cleanName = typeof namaNasabah === "string" ? namaNasabah.trim() : "";
      const cleanCif = typeof cif === "string" ? cif.trim() : "";
      if (!cleanName || !cleanCif) {
        return res.status(400).json({ error: "Nama Nasabah dan CIF wajib diisi." });
      }

      const cleanFoto = typeof fotoTring === "string" ? fotoTring.trim() : "";
      if (!isValidImageDataUrl(cleanFoto)) {
        return res.status(400).json({ error: "Format foto TRING tidak valid." });
      }

      const currentData = ensureDbFile();
      const newEntry: RekapEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tanggal: typeof tanggal === "string" && tanggal.trim() ? tanggal.trim() : getLocalDateString(),
        namaNasabah: cleanName,
        cif: cleanCif,
        produk: typeof produk === "string" && produk.trim() ? produk.trim() : "Tabungan Emas",
        fotoTring: cleanFoto,
        keterangan: typeof keterangan === "string" ? keterangan.trim() : "Sukses",
        createdAt: new Date().toISOString()
      };

      currentData.entries.push(newEntry);
      saveDb(currentData);

      res.status(201).json({ success: true, entry: newEntry, total: currentData.entries.length });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to add entry", details: err.message });
    }
  });

  // Update existing entry
  app.put("/api/rekap/entries/:id", (req, res) => {
    try {
      const { id } = req.params;
      const currentData = ensureDbFile();
      const index = currentData.entries.findIndex(e => e.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Entry not found" });
      }

      const body = req.body || {};
      const existing = currentData.entries[index];

      const nextName =
        body.namaNasabah !== undefined ? String(body.namaNasabah).trim() : existing.namaNasabah;
      const nextCif =
        body.cif !== undefined ? String(body.cif).trim() : existing.cif;

      if (!nextName || !nextCif) {
        return res.status(400).json({ error: "Nama Nasabah dan CIF wajib diisi." });
      }

      const nextFoto =
        body.fotoTring !== undefined ? String(body.fotoTring).trim() : existing.fotoTring || "";
      if (!isValidImageDataUrl(nextFoto)) {
        return res.status(400).json({ error: "Format foto TRING tidak valid." });
      }

      currentData.entries[index] = {
        ...existing,
        tanggal: body.tanggal !== undefined ? String(body.tanggal).trim() : existing.tanggal,
        namaNasabah: nextName,
        cif: nextCif,
        produk: body.produk !== undefined ? String(body.produk).trim() : existing.produk,
        fotoTring: nextFoto,
        keterangan:
          body.keterangan !== undefined ? String(body.keterangan).trim() : existing.keterangan,
        id: existing.id,
        createdAt: existing.createdAt,
      };
      saveDb(currentData);

      res.json({ success: true, entry: currentData.entries[index] });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update entry", details: err.message });
    }
  });

  // Delete entry
  app.delete("/api/rekap/entries/:id", (req, res) => {
    try {
      const { id } = req.params;
      const currentData = ensureDbFile();
      const filtered = currentData.entries.filter(e => e.id !== id);
      currentData.entries = filtered;
      saveDb(currentData);

      res.json({ success: true, remaining: currentData.entries.length });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete entry", details: err.message });
    }
  });

  // Reset or Seed sample data
  app.post("/api/rekap/reset", (req, res) => {
    try {
      const { action } = req.body || {};
      const currentData = ensureDbFile();
      if (action === "clear-all") {
        currentData.entries = [];
      } else {
        currentData.entries = DEFAULT_ENTRIES.map((item) => ({ ...item }));
        currentData.headerInfo = { ...DEFAULT_HEADER, tanggalLaporan: getLocalDateString() };
      }
      saveDb(currentData);
      res.json({ success: true, data: currentData });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to reset data", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
