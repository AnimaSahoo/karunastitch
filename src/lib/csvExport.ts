/**
 * Safe CSV export utility - replaces vulnerable xlsx package.
 * Generates RFC 4180-compliant CSV files with proper escaping.
 */

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // If value contains comma, double quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string
 */
export function jsonToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(",");

  const rows = data.map((row) =>
    headers.map((header) => escapeCSVValue(row[header])).join(",")
  );

  return [headerRow, ...rows].join("\n");
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(data: Record<string, unknown>[], fileName: string): void {
  const csv = jsonToCSV(data);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8 compat
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
