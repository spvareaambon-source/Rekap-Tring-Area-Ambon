import { HeaderInfo, RekapData, RekapEntry } from "./types";

const LOCAL_STORAGE_KEY = "rekap_pds_data_cache_v1";

export async function fetchRekapData(): Promise<RekapData> {
  try {
    const res = await fetch("/api/rekap");
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    const data: RekapData = await res.json();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn("Using local cache fallback for rekap data:", err);
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw err;
  }
}

export async function updateHeaderInfo(header: Partial<HeaderInfo>): Promise<HeaderInfo> {
  const res = await fetch("/api/rekap/header", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(header)
  });
  if (!res.ok) {
    throw new Error(`Failed to update header info: ${res.statusText}`);
  }
  const data = await res.json();
  return data.headerInfo;
}

export async function addRekapEntry(entry: Omit<RekapEntry, "id" | "createdAt">): Promise<RekapEntry> {
  const res = await fetch("/api/rekap/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to add entry: ${res.statusText}`);
  }
  const data = await res.json();
  return data.entry;
}

export async function updateRekapEntry(id: string, entry: Partial<RekapEntry>): Promise<RekapEntry> {
  const res = await fetch(`/api/rekap/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });
  if (!res.ok) {
    throw new Error(`Failed to update entry: ${res.statusText}`);
  }
  const data = await res.json();
  return data.entry;
}

export async function deleteRekapEntry(id: string): Promise<void> {
  const res = await fetch(`/api/rekap/entries/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    throw new Error(`Failed to delete entry: ${res.statusText}`);
  }
}

export async function resetRekapData(action: "seed" | "clear-all"): Promise<RekapData> {
  const res = await fetch("/api/rekap/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action })
  });
  if (!res.ok) {
    throw new Error(`Failed to reset data: ${res.statusText}`);
  }
  const result = await res.json();
  return result.data;
}
