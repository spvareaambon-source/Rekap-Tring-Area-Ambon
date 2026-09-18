import { HeaderInfo, RekapData, RekapEntry } from "./types";

const LOCAL_STORAGE_KEY = "rekap_tring_area_ambon_data_v1";

const DEFAULT_DATA: RekapData = {
  headerInfo: {
    lampiran: "Lampiran V",
    nomorSurat: "121/SE/2026",
    tanggalSurat: "24 Agustus 2023",
    judulRekap: "REKAPITULASI AKTIVASI REK TABUNGAN EMAS PRE AKTIF VIA TRING",
    subJudul: "DENGAN MINIMAL TRANSAKSI RP100.000",
    namaCro: "",
    nikCro: "",
    kodeCabang: "11169",
    namaCabang: "AMBON",
    kota: "Ambon",
    tanggalLaporan: new Date().toISOString().slice(0, 10),
    namaPemimpinCabang: "",
    nikPemimpinCabang: "",
    namaBpoPenjualan: "",
    nikBpoPenjualan: "",
    namaKadiv: "",
    nikKadiv: "",
    catatan:
      "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah."
  },
  entries: []
};

function saveData(data: RekapData): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

function loadData(): RekapData {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!cached) {
    saveData(DEFAULT_DATA);
    return structuredClone(DEFAULT_DATA);
  }

  try {
    return JSON.parse(cached) as RekapData;
  } catch {
    saveData(DEFAULT_DATA);
    return structuredClone(DEFAULT_DATA);
  }
}

export async function fetchRekapData(): Promise<RekapData> {
  return loadData();
}

export async function updateHeaderInfo(
  header: Partial<HeaderInfo>
): Promise<HeaderInfo> {
  const data = loadData();

  data.headerInfo = {
    ...data.headerInfo,
    ...header
  };

  saveData(data);

  return data.headerInfo;
}

export async function addRekapEntry(
  entry: Omit<RekapEntry, "id" | "createdAt">
): Promise<RekapEntry> {
  const data = loadData();

  const newEntry: RekapEntry = {
    ...entry,
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };

  data.entries.push(newEntry);

  saveData(data);

  return newEntry;
}

export async function updateRekapEntry(
  id: string,
  entry: Partial<RekapEntry>
): Promise<RekapEntry> {
  const data = loadData();

  const index = data.entries.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Data rekap tidak ditemukan.");
  }

  data.entries[index] = {
    ...data.entries[index],
    ...entry,
    id: data.entries[index].id
  };

  saveData(data);

  return data.entries[index];
}

export async function deleteRekapEntry(id: string): Promise<void> {
  const data = loadData();

  data.entries = data.entries.filter((item) => item.id !== id);

  saveData(data);
}

export async function resetRekapData(
  action: "seed" | "clear-all"
): Promise<RekapData> {
  if (action === "clear-all") {
    const emptyData: RekapData = {
      ...structuredClone(DEFAULT_DATA),
      entries: []
    };

    saveData(emptyData);
    return emptyData;
  }

  const seededData = structuredClone(DEFAULT_DATA);

  saveData(seededData);

  return seededData;
}