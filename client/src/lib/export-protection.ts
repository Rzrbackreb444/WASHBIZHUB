import { apiRequest } from "@/lib/queryClient";

interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  data: any;
  filename: string;
  title?: string;
  includeWatermark?: boolean;
}

interface ExportResult {
  success: boolean;
  url?: string;
  error?: string;
  watermarked?: boolean;
  expiresAt?: string;
}

export async function requestSecureExport(options: ExportOptions): Promise<ExportResult> {
  try {
    const response = await apiRequest("/api/exports/request", {
      method: "POST",
      body: JSON.stringify({
        format: options.format,
        data: options.data,
        filename: options.filename,
        title: options.title,
      }),
    });

    return response as ExportResult;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to generate export",
    };
  }
}

export function addClientWatermark(data: any, userId?: string): any {
  if (!data || typeof data !== "object") return data;

  const watermark = {
    _washbizhub_export: {
      exported_at: new Date().toISOString(),
      exported_by: userId || "anonymous",
      license: "Proprietary - WashBizHub",
      tracking_id: generateTrackingId(),
      copyright: "© 2025 WashBizHub.com. All rights reserved.",
    },
  };

  if (Array.isArray(data)) {
    return {
      data,
      ...watermark,
    };
  }

  return {
    ...data,
    ...watermark,
  };
}

function generateTrackingId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatExportFilename(
  baseName: string,
  format: string,
  includeTimestamp: boolean = true
): string {
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const timestamp = includeTimestamp
    ? `-${new Date().toISOString().slice(0, 10)}`
    : "";

  return `washbizhub-${sanitized}${timestamp}.${format}`;
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any, filename: string, includeWatermark: boolean = true): void {
  const exportData = includeWatermark ? addClientWatermark(data) : data;
  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, formatExportFilename(filename, "json"), "application/json");
}

export function exportToCSV(
  data: any[],
  filename: string,
  columns?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  const headers = columns
    ? columns.map((c) => c.label)
    : Object.keys(data[0]);

  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
    "",
    "# Exported from WashBizHub.com",
    `# Generated: ${new Date().toISOString()}`,
    "# © 2025 WashBizHub.com. All rights reserved.",
  ];

  downloadFile(csvRows.join("\n"), formatExportFilename(filename, "csv"), "text/csv");
}

export interface ExportPermissions {
  canExport: boolean;
  availableFormats: string[];
  requiresWatermark: boolean;
  monthlyLimit: number;
  exportsUsed: number;
  exportsRemaining: number;
}

export async function getExportPermissions(): Promise<ExportPermissions> {
  try {
    const response = await apiRequest("/api/exports/permissions", {
      method: "GET",
    });
    return response as ExportPermissions;
  } catch (error) {
    return {
      canExport: false,
      availableFormats: [],
      requiresWatermark: true,
      monthlyLimit: 0,
      exportsUsed: 0,
      exportsRemaining: 0,
    };
  }
}

export async function logExportEvent(
  type: string,
  format: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await apiRequest("/api/exports/log", {
      method: "POST",
      body: JSON.stringify({
        type,
        format,
        metadata,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.warn("Failed to log export event:", error);
  }
}
