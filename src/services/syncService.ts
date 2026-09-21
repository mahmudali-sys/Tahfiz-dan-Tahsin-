import { Student, Teacher, StudentReportData, SchoolSettings } from '../types';

export interface SyncStatus {
  version: number;
  lastUpdated: string;
  updatedByDevice?: string;
  studentsCount: number;
  reportsCount: number;
}

export interface FullSyncData {
  version: number;
  lastUpdated: string;
  students: Student[];
  teachers: Teacher[];
  reports: Record<string, StudentReportData>;
  settings: SchoolSettings;
}

export function detectDeviceName(): string {
  if (typeof window === 'undefined') return 'Server';
  const ua = navigator.userAgent;
  const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIPad) return 'iPad';
  if (/Tablet|Android(?!.*Mobile)/i.test(ua)) return 'Tablet';
  if (/iPhone|Android.*Mobile|Mobile/i.test(ua)) return 'HP (Smartphone)';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Laptop (Mac)';
  if (/Windows/i.test(ua)) return 'Laptop/PC (Windows)';
  return 'Laptop/PC';
}

/**
 * Fetch the latest synchronized database from the centralized server
 */
export async function fetchServerData(): Promise<FullSyncData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Sync fetch failed with status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.students && data.reports) {
      return data as FullSyncData;
    }
    return null;
  } catch (err) {
    console.warn('[Sync] Could not fetch server database (offline or starting up):', err);
    return null;
  }
}

/**
 * Fast lightweight polling status check
 */
export async function checkServerStatus(): Promise<SyncStatus | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/sync/status', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    return (await res.json()) as SyncStatus;
  } catch {
    return null;
  }
}

/**
 * Sync entire dataset to server (when importing, modifying settings, or mass updating)
 */
export async function pushFullSyncData(payload: {
  students?: Student[];
  teachers?: Teacher[];
  reports?: Record<string, StudentReportData>;
  settings?: SchoolSettings;
}): Promise<{ success: boolean; version?: number; lastUpdated?: string }> {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        deviceName: detectDeviceName(),
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[Sync] Error pushing full sync data:', err);
    return { success: false };
  }
}

/**
 * Sync a single student's report immediately to the server
 */
export async function pushSingleReport(
  studentId: string,
  report: StudentReportData
): Promise<{ success: boolean; version?: number; lastUpdated?: string }> {
  try {
    const res = await fetch('/api/sync/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        report,
        deviceName: detectDeviceName(),
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[Sync] Error pushing report for student ${studentId}:`, err);
    return { success: false };
  }
}

/**
 * Sync a batch of student reports (used by Pengolahan Nilai Excel matrix)
 */
export async function pushBatchReports(
  reports: Record<string, StudentReportData>
): Promise<{ success: boolean; version?: number; lastUpdated?: string; updatedCount?: number }> {
  try {
    const res = await fetch('/api/sync/reports-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reports,
        deviceName: detectDeviceName(),
      }),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[Sync] Error pushing batch reports:', err);
    return { success: false };
  }
}

/**
 * Reset server database to initial mock state
 */
export async function pushResetDatabase(): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch (err) {
    console.error('[Sync] Error resetting server database:', err);
    return false;
  }
}
