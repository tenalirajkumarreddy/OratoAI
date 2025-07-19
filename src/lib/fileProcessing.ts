export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For now, we'll use a simple text extraction
        // In a production environment, you'd want to use a library like PDF.js
        const text = await extractTextFromArrayBuffer(arrayBuffer);
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
}

async function extractTextFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a simplified implementation
  // In production, you would use PDF.js or send to a backend service
  try {
    // Try to extract basic text content
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let text = decoder.decode(uint8Array);
    
    // Simple PDF text extraction (very basic)
    // This will work for simple PDFs but may not work for complex ones
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    text = text.replace(/\s+/g, ' ');
    
    if (text.length < 50) {
      return `PDF content extracted from ${arrayBuffer.byteLength} bytes. For better text extraction, consider using a dedicated PDF parsing service.`;
    }
    
    return text.substring(0, 5000); // Limit to first 5000 characters
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'Unable to extract text from this PDF. The file may be protected or contain only images.';
  }
}

export async function extractTextFromImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    // For image OCR, you would typically use a service like Tesseract.js
    // or send to a backend OCR service. For now, we'll return a placeholder
    const reader = new FileReader();
    
    reader.onload = function() {
      // In production, you would process the image for OCR here
      resolve(`Image "${file.name}" uploaded successfully. OCR functionality would extract text from this image. File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    };
    
    reader.onerror = () => {
      resolve(`Failed to process image "${file.name}"`);
    };
    
    reader.readAsDataURL(file);
  });
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  return allowedTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
