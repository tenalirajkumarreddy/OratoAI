'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { extractTextFromPDF, extractTextFromImage, validateFileType, formatFileSize } from '@/lib/fileProcessing';
import { UploadedFile } from '@/types';

interface FileUploadProps {
  onFileProcessed: (content: string, file: UploadedFile) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function FileUpload({ onFileProcessed, maxFiles = 3, maxFileSize = 10 }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    // Validate file count
    if (files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files at once.`,
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      // Validate file type
      if (!validateFileType(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxFileSize}MB.`,
          variant: "destructive",
        });
        continue;
      }

      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    
    try {
      setUploadingFiles(prev => new Set([...prev, fileId]));
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileId] || 0;
          if (current < 70) {
            return { ...prev, [fileId]: current + 10 };
          }
          return prev;
        });
      }, 200);

      let content = '';
      
      // Process based on file type
      if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        content = await extractTextFromImage(file);
      } else {
        // Handle text files
        content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        uploadedAt: new Date(),
      };

      // Notify parent component
      onFileProcessed(content, uploadedFile);

      toast({
        title: "File processed successfully",
        description: `${file.name} has been processed and is ready for discussion.`,
      });

      // Clean up after a delay
      setTimeout(() => {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);

    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "File processing failed",
        description: `Failed to process ${file.name}. Please try again.`,
        variant: "destructive",
      });
      
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`p-6 border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragOver ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Documents
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                PDF
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Images
              </span>
              <span>•</span>
              <span>Max {maxFiles} files</span>
              <span>•</span>
              <span>Up to {maxFileSize}MB each</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="pointer-events-none">
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadingFiles.size > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Processing Files</h4>
          {Array.from(uploadingFiles).map(fileId => {
            const fileName = fileId.split('-')[0];
            const progress = uploadProgress[fileId] || 0;
            
            return (
              <div key={fileId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate">{fileName}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <div>
            <p><strong>Supported formats:</strong> PDF documents, images (PNG, JPG, WEBP), text files</p>
            <p><strong>File processing:</strong> Text will be extracted and used as context for your conversation</p>
            <p><strong>Privacy:</strong> Files are processed locally when possible and are not stored permanently</p>
          </div>
        </div>
      </div>
    </div>
  );
}
