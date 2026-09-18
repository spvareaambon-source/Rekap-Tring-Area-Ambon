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

const DEFAULT_HEADER: HeaderInfo = {
  lampiran: "Lampiran V",
  nomorSurat: "121/SE/2026",
  tanggalSurat: "24 Agustus 2023",
  judulRekap: "REKAPITULASI AKTIVASI REK TABUNGAN EMAS PRE AKTIF VIA TRING",
  subJudul: "DENGAN MINIMAL TRANSAKSI RP100.000",
  namaCro: "Rian Pratama",
  nikCro: "P.88210",
  kodeCabang: "00421",
  namaCabang: "CP Ambon",
  kota: "Ambon",
  tanggalLaporan: new Date().toISOString().split("T")[0],
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

    // Migrate any legacy PDS/PSDS mentions to TRING
    let modified = false;
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
      const currentData = ensureDbFile();
      currentData.headerInfo = {
        ...currentData.headerInfo,
        ...req.body
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
      const { tanggal, namaNasabah, cif, produk, fotoTring, keterangan } = req.body;
      if (!namaNasabah || !cif) {
        return res.status(400).json({ error: "Nama Nasabah dan CIF wajib diisi." });
      }

      const currentData = ensureDbFile();
      const newEntry: RekapEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        tanggal: tanggal || new Date().toISOString().split("T")[0],
        namaNasabah: String(namaNasabah).trim(),
        cif: String(cif).trim(),
        produk: String(produk || "Tabungan Emas").trim(),
        fotoTring: fotoTring || "",
        keterangan: keterangan || "Sukses",
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

      currentData.entries[index] = {
        ...currentData.entries[index],
        ...req.body,
        id // protect id
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
      const { action } = req.body;
      const currentData = ensureDbFile();
      if (action === "clear-all") {
        currentData.entries = [];
      } else {
        currentData.entries = [...DEFAULT_ENTRIES];
        currentData.headerInfo = { ...DEFAULT_HEADER };
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
