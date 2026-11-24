import {
  HeaderInfo,
  RekapData,
  RekapEntry,
  createDefaultRekapData,
  normalizeCabangName,
} from "./types";

const LOCAL_STORAGE_KEY = "rekap_tring_area_ambon_data_v1";

function normalizeRekapData(raw: RekapData): RekapData {
  const defaults = createDefaultRekapData();
  const headerInfo: HeaderInfo = {
    ...defaults.headerInfo,
    ...(raw?.headerInfo || {}),
    namaCabang: normalizeCabangName(raw?.headerInfo?.namaCabang),
  };

  return {
    headerInfo,
    entries: Array.isArray(raw?.entries) ? raw.entries : [],
  };
}

function saveLocalCache(data: RekapData, throwOnQuotaError = false): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err: any) {
    if (throwOnQuotaError) {
      if (err?.name === "QuotaExceededError" || err?.code === 22) {
        throw new Error("Penyimpanan browser penuh. Perkecil ukuran foto atau hapus data lama.");
      }
      throw err;
    }
  }
}

function loadLocalData(): RekapData {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!cached) {
    const seeded = createDefaultRekapData();
    saveLocalCache(seeded, false);
    return seeded;
  }

  try {
    const parsed = JSON.parse(cached) as RekapData;
    const normalized = normalizeRekapData(parsed);
    if (normalized.entries.length === 0 && !parsed?.headerInfo?.namaCro) {
      const seeded = createDefaultRekapData();
      saveLocalCache(seeded, false);
      return seeded;
    }
    return normalized;
  } catch {
    const seeded = createDefaultRekapData();
    saveLocalCache(seeded, false);
    return seeded;
  }
}

async function callServerApi<T>(
  url: string,
  options?: RequestInit
): Promise<{ available: true; data: T } | { available: false }> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      // Static hosting rewrite (e.g. Vercel SPA fallback returning index.html)
      return { available: false };
    }

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.error || `Server error (${res.status})`);
    }

    return { available: true, data: payload as T };
  } catch (err: any) {
    // Re-throw explicit API validation errors (4xx/5xx JSON responses)
    if (err instanceof Error && !err.message.includes("Failed to fetch") && err.name !== "TypeError") {
      throw err;
    }
    return { available: false };
  }
}

export async function fetchRekapData(): Promise<RekapData> {
  const serverResult = await callServerApi<RekapData>("/api/rekap", { method: "GET" });
  if (serverResult.available) {
    const normalized = normalizeRekapData(serverResult.data);
    saveLocalCache(normalized, false);
    return normalized;
  }

  return loadLocalData();
}

export async function updateHeaderInfo(
  header: Partial<HeaderInfo>
): Promise<HeaderInfo> {
  const normalizedPatch: Partial<HeaderInfo> = {
    ...header,
    ...(header.namaCabang !== undefined
      ? { namaCabang: normalizeCabangName(header.namaCabang) }
      : {}),
  };

  const serverResult = await callServerApi<{ success: boolean; headerInfo: HeaderInfo }>(
    "/api/rekap/header",
    {
      method: "PUT",
      body: JSON.stringify(normalizedPatch),
    }
  );

  if (serverResult.available) {
    const updatedHeader = {
      ...serverResult.data.headerInfo,
      namaCabang: normalizeCabangName(serverResult.data.headerInfo.namaCabang),
    };
    const local = loadLocalData();
    saveLocalCache({ ...local, headerInfo: updatedHeader }, false);
    return updatedHeader;
  }

  const data = loadLocalData();
  data.headerInfo = {
    ...data.headerInfo,
    ...normalizedPatch,
  };
  saveLocalCache(data, true);
  return data.headerInfo;
}

export async function addRekapEntry(
  entry: Omit<RekapEntry, "id" | "createdAt">
): Promise<RekapEntry> {
  const serverResult = await callServerApi<{ success: boolean; entry: RekapEntry }>(
    "/api/rekap/entries",
    {
      method: "POST",
      body: JSON.stringify(entry),
    }
  );

  if (serverResult.available) {
    const local = loadLocalData();
    local.entries.push(serverResult.data.entry);
    saveLocalCache(local, false);
    return serverResult.data.entry;
  }

  const data = loadLocalData();
  const newEntry: RekapEntry = {
    ...entry,
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  data.entries.push(newEntry);
  saveLocalCache(data, true);
  return newEntry;
}

export async function updateRekapEntry(
  id: string,
  entry: Partial<RekapEntry>
): Promise<RekapEntry> {
  const serverResult = await callServerApi<{ success: boolean; entry: RekapEntry }>(
    `/api/rekap/entries/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(entry),
    }
  );

  if (serverResult.available) {
    const local = loadLocalData();
    local.entries = local.entries.map((item) =>
      item.id === id ? serverResult.data.entry : item
    );
    saveLocalCache(local, false);
    return serverResult.data.entry;
  }

  const data = loadLocalData();
  const index = data.entries.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Data rekap tidak ditemukan.");
  }

  data.entries[index] = {
    ...data.entries[index],
    ...entry,
    id: data.entries[index].id,
  };
  saveLocalCache(data, true);
  return data.entries[index];
}

export async function deleteRekapEntry(id: string): Promise<void> {
  const serverResult = await callServerApi<{ success: boolean }>(
    `/api/rekap/entries/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (serverResult.available) {
    const local = loadLocalData();
    local.entries = local.entries.filter((item) => item.id !== id);
    saveLocalCache(local, false);
    return;
  }

  const data = loadLocalData();
  data.entries = data.entries.filter((item) => item.id !== id);
  saveLocalCache(data, true);
}

export async function resetRekapData(
  action: "seed" | "clear-all"
): Promise<RekapData> {
  const serverResult = await callServerApi<{ success: boolean; data: RekapData }>(
    "/api/rekap/reset",
    {
      method: "POST",
      body: JSON.stringify({ action }),
    }
  );

  if (serverResult.available) {
    const normalized = normalizeRekapData(serverResult.data.data);
    saveLocalCache(normalized, false);
    return normalized;
  }

  const seeded = createDefaultRekapData();
  if (action === "clear-all") {
    const emptyData: RekapData = {
      ...seeded,
      entries: [],
    };
    saveLocalCache(emptyData, true);
    return emptyData;
  }

  saveLocalCache(seeded, true);
  return seeded;
}