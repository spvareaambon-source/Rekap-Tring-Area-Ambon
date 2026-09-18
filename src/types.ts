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
