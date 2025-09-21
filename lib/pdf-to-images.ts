// Dynamic import to ensure PDF.js only runs in browser environment
let pdfjsLib: any = null;

const initializePDFJS = async () => {
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only run in browser environment');
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    
    // Use the local worker file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }
  
  return pdfjsLib;
};

export interface PDFPageImage {
  page: number;
  image: string; // base64 data URL
  width: number;
  height: number;
}

export interface PDFConversionResult {
  totalPages: number;
  images: PDFPageImage[];
  fileName: string;
}

/**
 * Convert PDF file to images using PDF.js
 */
export async function convertPDFToImages(
  pdfFile: File | string,
  maxPages: number = 50
): Promise<PDFConversionResult> {
  try {
    // Initialize PDF.js
    const pdfjs = await initializePDFJS();
    
    let pdfData;
    
    if (typeof pdfFile === 'string') {
      // Handle URL
      const response = await fetch(pdfFile);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfData = new Uint8Array(arrayBuffer);
    } else {
      // Handle File object
      const arrayBuffer = await pdfFile.arrayBuffer();
      pdfData = new Uint8Array(arrayBuffer);
    }

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    const totalPages = pdf.numPages;
    const pagesToConvert = Math.min(maxPages, totalPages);
    
    const images: PDFPageImage[] = [];
    
    // Convert each page to image
    for (let pageNum = 1; pageNum <= pagesToConvert; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to base64 image
        const imageDataUrl = canvas.toDataURL('image/png');
        
        images.push({
          page: pageNum,
          image: imageDataUrl,
          width: viewport.width,
          height: viewport.height,
        });
      } catch (pageError) {
        console.warn(`Failed to convert page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    return {
      totalPages: totalPages,
      images,
      fileName: typeof pdfFile === 'string' ? pdfFile.split('/').pop() || 'document.pdf' : pdfFile.name,
    };
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to images');
  }
}

/**
 * Convert PDF URL to images
 */
export async function convertPDFUrlToImages(
  pdfUrl: string,
  maxPages: number = 50
): Promise<PDFConversionResult> {
  try {
    return await convertPDFToImages(pdfUrl, maxPages);
  } catch (error) {
    console.error('PDF URL conversion error:', error);
    throw new Error('Failed to convert PDF URL to images');
  }
}

/**
 * Create a mock PDF preview for fallback
 */
export function createMockPDFPreview(fileName: string): PDFConversionResult {
  if (typeof window === 'undefined') {
    throw new Error('Mock preview can only be created in browser environment');
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 600);
    
    // Border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 380, 580);
    
    // Title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PDF Preview', 200, 100);
    
    // File name
    ctx.font = '16px Arial';
    ctx.fillText(fileName, 200, 140);
    
    // Mock content
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('This is a mock PDF preview.', 50, 200);
    ctx.fillText('The actual PDF conversion', 50, 230);
    ctx.fillText('failed or is not available.', 50, 260);
    
    // Page indicator
    ctx.textAlign = 'center';
    ctx.fillText('Page 1 of 1', 200, 550);
  }
  
  const mockImage = canvas.toDataURL('image/png');
  
  return {
    totalPages: 1,
    images: [{
      page: 1,
      image: mockImage,
      width: 400,
      height: 600,
    }],
    fileName,
  };
}