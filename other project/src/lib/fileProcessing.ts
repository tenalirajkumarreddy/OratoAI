'use client';

// Lazy import PDF.js to avoid SSR issues
let pdfjs: any = null;

async function getPDFJS() {
  if (typeof window === 'undefined') return null;
  
  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
  }
  return pdfjs;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await getPDFJS();
    if (!pdfjsLib) {
      throw new Error('PDF processing is not available on server-side');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromImage(file: File): Promise<string> {
  // For now, return a placeholder. In a real implementation,
  // you would integrate with an OCR service like Tesseract.js
  // or send to a server-side OCR service
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`[Image content from ${file.name}]\nNote: OCR functionality would extract text from this image in a production environment.`);
    }, 1000);
  });
}

export function validateFileType(file: File): { isValid: boolean; type: 'pdf' | 'image' | 'unknown' } {
  const pdfTypes = ['application/pdf'];
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (pdfTypes.includes(file.type)) {
    return { isValid: true, type: 'pdf' };
  } else if (imageTypes.includes(file.type)) {
    return { isValid: true, type: 'image' };
  } else {
    return { isValid: false, type: 'unknown' };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
