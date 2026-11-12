/*
  +----------------------------------------------------------------------------+
  | Airgead Investment Calculator                                              |
  | Purpose: csv-export.js Downloads CSV reports with correct escaping and     |
  |          protection against spreadsheet formula interpretation.            |
  | Author: Alysha Pursley                                                     |
  | Copyright (c) 2026 Alysha Pursley.                                         |
  +----------------------------------------------------------------------------+
*/

/**
 * Exports CSV with spreadsheet-formula protection for user-controlled cells.
 * @param {string} filename
 * @param {Array<Array<unknown>>} rows
 * @returns {void}
 */
export function downloadCsv(filename, rows) {
    const csv = rows
        .map((row) =>
            row
                .map((value) => {
                    const text = String(value);
                    // Spreadsheet programs may evaluate cells beginning with formula
                    // operators. Preserve the value as text when exporting such input.
                    const safeText = /^[\s\uFEFF]*[=+@-]/u.test(text)
                        ? "'" + text
                        : text;

                    return `"${safeText.replaceAll('"', '""')}"`;
                })
                .join(","),
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    try {
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        URL.revokeObjectURL(url);
    }
}
