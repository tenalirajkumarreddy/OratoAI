'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, File, Image, X, Loader2 } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, validateFileType, formatFileSize } from '@/lib/fileProcessing';
import { UploadedFile } from '@/types';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  isDisabled?: boolean;
}

export function FileUpload({ 
  onFilesUploaded, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  isDisabled = false 
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const processFile = async (file: File): Promise<UploadedFile | null> => {
    try {
      const validation = validateFileType(file);
      
      if (!validation.isValid) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      if (file.size > maxSize) {
        throw new Error(`File too large: ${formatFileSize(file.size)}. Max size: ${formatFileSize(maxSize)}`);
      }

      setProcessing(prev => [...prev, file.name]);

      let content = '';
      if (validation.type === 'pdf') {
        content = await extractTextFromPDF(file);
      } else if (validation.type === 'image') {
        content = await extractTextFromImage(file);
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}_${file.name}`,
        name: file.name,
        type: validation.type,
        size: file.size,
        content,
        uploadedAt: new Date()
      };

      return uploadedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setErrors(prev => [...prev, `${file.name}: ${errorMessage}`]);
      return null;
    } finally {
      setProcessing(prev => prev.filter(name => name !== file.name));
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isDisabled) return;

    // Check if adding these files would exceed the limit
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setErrors(prev => [...prev, `Cannot upload more than ${maxFiles} files`]);
      return;
    }

    setErrors([]);
    
    const processedFiles: UploadedFile[] = [];
    
    for (const file of acceptedFiles) {
      const processedFile = await processFile(file);
      if (processedFile) {
        processedFiles.push(processedFile);
      }
    }

    const newFiles = [...uploadedFiles, ...processedFiles];
    setUploadedFiles(newFiles);
    onFilesUploaded(processedFiles);
  }, [uploadedFiles, maxFiles, maxSize, isDisabled, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: isDisabled || uploadedFiles.length >= maxFiles,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    const newFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newFiles);
    onFilesUploaded(newFiles);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <File className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isDisabled || uploadedFiles.length >= maxFiles ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <div className="text-sm">
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <>
              <p>Drag & drop PDF files or images here, or click to select</p>
              <p className="text-muted-foreground mt-1">
                Supports PDF and image files (PNG, JPG, GIF, WebP) up to {formatFileSize(maxSize)}
              </p>
            </>
          )}
        </div>
        {uploadedFiles.length >= maxFiles && (
          <p className="text-sm text-destructive mt-2">
            Maximum number of files reached ({maxFiles})
          </p>
        )}
      </div>

      {/* Processing Status */}
      {processing.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Processing Files:</h4>
          {processing.map(filename => (
            <div key={filename} className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing {filename}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-destructive">Upload Errors:</h4>
            <Button variant="ghost" size="sm" onClick={clearErrors}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length}/{maxFiles}):</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded border">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type.toUpperCase()} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
