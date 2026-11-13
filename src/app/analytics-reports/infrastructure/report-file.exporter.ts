import { DOCUMENT, inject, Injectable } from '@angular/core';

/**
 * Turns report content into a downloadable file in the browser (US-28).
 */
@Injectable({ providedIn: 'root' })
export class ReportFileExporter {
  private readonly document = inject(DOCUMENT);

  downloadCsv(fileName: string, content: string): void {
    // The BOM lets Excel open accented characters and CO₂ correctly.
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
  }
}
