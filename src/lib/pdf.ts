import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPDFOptions {
  filename?: string;
  scale?: number;
  quality?: number;
  pageFormat?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  useCORS?: boolean;
  logging?: boolean;
}

/**
 * Tạo style sheet để xóa unsupported color functions
 */
const addColorFixStyleSheet = (): void => {
  const style = document.createElement('style');
  style.textContent = `
    * {
      color: inherit !important;
      background-color: inherit !important;
      border-color: inherit !important;
    }
  `;
  style.id = 'pdf-export-color-fix';
  document.head.appendChild(style);
};

/**
 * Xóa style sheet fix color
 */
const removeColorFixStyleSheet = (): void => {
  const style = document.getElementById('pdf-export-color-fix');
  if (style) {
    style.remove();
  }
};

/**
 * Xuất HTML element thành PDF file
 * @param element - DOM element cần xuất
 * @param filename - Tên file PDF
 * @param options - Tùy chọn xuất PDF
 */
export const exportElementToPDF = async (
  element: HTMLElement,
  filename: string = 'document.pdf',
  options: ExportPDFOptions = {}
): Promise<void> => {
  const {
    scale = 2,
    quality = 0.95,
    pageFormat = 'a4',
    orientation = 'portrait',
    useCORS = true,
    logging = false,
  } = options;

  // Save original state
  const htmlElement = document.documentElement;
  const wasDarkMode = htmlElement.classList.contains('dark');
  const originalOverflow = element.style.overflow;
  const originalMargin = element.style.margin;
  const originalPadding = element.style.padding;

  try {
    // Disable dark mode
    if (wasDarkMode) {
      htmlElement.classList.remove('dark');
    }

    // Add color fix stylesheet
    addColorFixStyleSheet();

    // Prepare element for rendering
    element.style.overflow = 'visible';
    element.style.margin = '0';
    element.style.padding = '0';

    // Convert HTML to canvas directly (no cloning to avoid iframe issues)
    const canvas = await html2canvas(element, {
      scale,
      useCORS,
      logging,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: false,
      imageTimeout: 10000,
      removeContainer: true,
    });

    // Calculate PDF dimensions
    const a4Width = 210; // mm
    const a4Height = 297; // mm
    const letterWidth = 215.9; // mm
    const letterHeight = 279.4; // mm

    const pageWidth = pageFormat === 'a4' ? a4Width : letterWidth;
    const pageHeight = pageFormat === 'a4' ? a4Height : letterHeight;

    // Calculate image dimensions maintaining aspect ratio
    const canvasAspectRatio = canvas.width / canvas.height;
    let imgWidth = pageWidth - 10; // 5mm margin on each side
    let imgHeight = imgWidth / canvasAspectRatio;

    // If height exceeds page height, scale down
    if (imgHeight > pageHeight - 10) {
      imgHeight = pageHeight - 10;
      imgWidth = imgHeight * canvasAspectRatio;
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageFormat,
    });

    // Convert canvas to image
    const canvasImageData = canvas.toDataURL('image/jpeg', quality);

    // Calculate positioning
    let yPosition = 5; // 5mm from top

    // Add image to PDF, splitting across pages if needed
    let heightLeft = imgHeight;
    let page = 0;

    while (heightLeft > 0) {
      if (page > 0) {
        pdf.addPage();
      }

      const currentHeight = Math.min(heightLeft, pageHeight - 10);
      const sourceHeight = (currentHeight / imgHeight) * canvas.height;

      // For simplicity, just add full image on each page
      if (page === 0) {
        pdf.addImage(canvasImageData, 'JPEG', 5, 5, imgWidth, imgHeight);
      } else {
        pdf.addImage(canvasImageData, 'JPEG', 5, 5, imgWidth, imgHeight);
      }

      heightLeft -= pageHeight - 10;
      page++;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Xuất PDF thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
  } finally {
    // Restore original state
    if (wasDarkMode) {
      htmlElement.classList.add('dark');
    }

    element.style.overflow = originalOverflow;
    element.style.margin = originalMargin;
    element.style.padding = originalPadding;

    // Remove color fix stylesheet
    removeColorFixStyleSheet();
  }
};

/**
 * Xuất Invoice/Phiếu ra PDF
 * @param element - DOM element chứa invoice
 * @param invoiceName - Tên hóa đơn/phiếu
 * @param invoiceId - ID của hóa đơn/phiếu
 */
export const exportInvoiceToPDF = async (
  element: HTMLElement,
  invoiceName: string = 'Phiếu',
  invoiceId: number | string = ''
): Promise<void> => {
  const date = new Date().toISOString().split('T')[0];
  const filename = invoiceId 
    ? `${invoiceName}_${invoiceId}_${date}.pdf`
    : `${invoiceName}_${date}.pdf`;

  await exportElementToPDF(element, filename, {
    scale: 2,
    quality: 0.95,
    pageFormat: 'a4',
    orientation: 'portrait',
  });
};
