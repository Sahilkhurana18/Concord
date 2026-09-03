"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

async function captureNode(targetId: string) {
  const node = document.getElementById(targetId);
  if (!node) throw new Error(`Export target #${targetId} not found`);
  // scale 2 = retina-quality export
  return html2canvas(node, { scale: 2, backgroundColor: "#ffffff" });
}

async function exportPng(targetId: string, filename: string) {
  const canvas = await captureNode(targetId);
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportPdf(targetId: string, filename: string) {
  const canvas = await captureNode(targetId);
  const imgData = canvas.toDataURL("image/png");

  // A4 in points, with pagination if content overflows one page
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
}

export function ExportButtons({ targetId }: { targetId: string }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportPng(targetId, "document")}
        className="px-3 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        Export PNG
      </button>
      <button
        onClick={() => exportPdf(targetId, "document")}
        className="px-3 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        Export PDF
      </button>
    </div>
  );
}
