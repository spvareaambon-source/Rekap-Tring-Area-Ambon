export interface RekapEntry {
  id: string;
  tanggal: string;
  namaNasabah: string;
  cif: string;
  produk: string;
  fotoTring?: string; // Data URL / Base64 image
  keterangan?: string;
  createdAt?: string;
}

export interface HeaderInfo {
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

export interface RekapData {
  headerInfo: HeaderInfo;
  entries: RekapEntry[];
}

export const PRODUK_OPTIONS = [
  "Tabungan Emas",
  "Cicil Emas",
  "Gadai Tabungan Emas",
  "Mulia",
  "Pembiayaan TRING",
  "Lainnya"
];

export const CABANG_OPTIONS = [
  "CP AMBON",
  "CP NUSANIWE",
  "CP PASSO",
  "CP MASOHI",
  "CP TUAL",
  "CPS AMBON",
] as const;

export function normalizeCabangName(namaCabang?: string): string {
  const trimmed = (namaCabang || "").trim().toUpperCase();
  if (!trimmed) return "CP AMBON";
  if ((CABANG_OPTIONS as readonly string[]).includes(trimmed)) {
    return trimmed;
  }
  const withoutCp = trimmed.replace(/^CP\s+/, "");
  const matched = CABANG_OPTIONS.find((opt) => opt === `CP ${withoutCp}` || opt === withoutCp);
  return matched || "CP AMBON";
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidImageDataUrl(value?: string): boolean {
  if (!value) return true;
  return /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/i.test(value.trim());
}

export function createDefaultRekapData(): RekapData {
  const today = getLocalDateString();
  return {
    headerInfo: {
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
      tanggalLaporan: today,
      namaPemimpinCabang: "Ahmad Fauzi, S.E.",
      nikPemimpinCabang: "P.65432",
      namaBpoPenjualan: "Budi Santoso",
      nikBpoPenjualan: "P.71098",
      namaKadiv: "",
      nikKadiv: "",
      catatan:
        "*Note : keterangan sukses dibuktikan dengan melampirkan screenshoot/foto sukses dari aplikasi TRING nasabah."
    },
    entries: [
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
    ]
  };
}
