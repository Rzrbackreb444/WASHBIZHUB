import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  File,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface UploadedFile {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
  if (contentType.startsWith('video/')) return <Video className="w-5 h-5" />;
  if (contentType === 'application/pdf') return <FileText className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function FileUpload({
  onFilesUploaded,
  existingFiles = [],
  maxFiles = 5,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = 10
}: FileUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    for (const file of selectedFiles) {
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an allowed file type`,
          variant: "destructive"
        });
        continue;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSizeMB}MB limit`,
          variant: "destructive"
        });
        continue;
      }

      await uploadFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setCurrentFileName(file.name);
    setUploadProgress(10);

    try {
      const urlResponse = await apiRequest("POST", "/api/forum/upload-url", {
        filename: file.name,
        contentType: file.type
      });
      const { uploadURL } = await urlResponse.json();
      
      setUploadProgress(30);

      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setUploadProgress(70);

      const completeResponse = await apiRequest("POST", "/api/forum/upload-complete", {
        rawUrl: uploadURL.split("?")[0],
        filename: file.name,
        contentType: file.type,
        size: file.size
      });
      const uploadedFile = await completeResponse.json();

      setUploadProgress(100);

      const newFile: UploadedFile = {
        url: uploadedFile.url,
        filename: file.name,
        contentType: file.type,
        size: file.size
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      onFilesUploaded(updatedFiles);

      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`
      });

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileName("");
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  const acceptString = acceptedTypes.map(type => {
    if (type.startsWith('image/')) return type;
    if (type.startsWith('video/')) return type;
    if (type === 'application/pdf') return '.pdf';
    if (type === 'application/msword') return '.doc';
    if (type.includes('wordprocessingml')) return '.docx';
    return type;
  }).join(',');

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => !uploading && fileInputRef.current?.click()}
        data-testid="file-upload-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptString}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
          data-testid="input-file-upload"
        />
        
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading {currentFileName}...</p>
            <Progress value={uploadProgress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Images, videos, PDFs up to {maxSizeMB}MB ({files.length}/{maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-muted-foreground">
                    {getFileIcon(file.contentType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {file.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
