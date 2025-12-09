import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  Search,
  X,
  Check,
  Loader2,
  Camera,
  User,
  Circle,
  Square,
} from "lucide-react";

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  userName?: string;
  onAvatarChange: (url: string, type: "upload" | "tenor" | "initials") => void;
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  { name: "navy", value: "#0A1628", label: "Navy" },
  { name: "gold", value: "#C8A661", label: "Gold" },
  { name: "teal", value: "#0D9488", label: "Teal" },
  { name: "coral", value: "#F87171", label: "Coral" },
  { name: "purple", value: "#8B5CF6", label: "Purple" },
] as const;

const PLACEHOLDER_GIFS = [
  { id: "1", url: "https://media.tenor.com/images/f5bc1ff3e6f3e4e6cc6b36b5f3e7b4a8/tenor.gif", preview: "https://media.tenor.com/images/f5bc1ff3e6f3e4e6cc6b36b5f3e7b4a8/tenor.gif" },
  { id: "2", url: "https://media.tenor.com/images/8f2e8b3f1c3a4c6b9d0e2f4a6b8c0d2e/tenor.gif", preview: "https://media.tenor.com/images/8f2e8b3f1c3a4c6b9d0e2f4a6b8c0d2e/tenor.gif" },
  { id: "3", url: "https://media.tenor.com/images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/tenor.gif", preview: "https://media.tenor.com/images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/tenor.gif" },
];

export function AvatarPicker({
  currentAvatarUrl,
  userName = "User",
  onAvatarChange,
  isOpen,
  onClose,
}: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "tenor" | "initials">("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [gifs, setGifs] = useState<Array<{ id: string; url: string; preview: string }>>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [hoveredGif, setHoveredGif] = useState<string | null>(null);
  
  const [selectedColor, setSelectedColor] = useState<typeof AVATAR_COLORS[number]>(AVATAR_COLORS[0]);
  const [avatarStyle, setAvatarStyle] = useState<"circle" | "rounded">("circle");

  const initials = useMemo(() => {
    const names = userName.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  }, [userName]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append("avatar", uploadedFile);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (previewUrl) {
        onAvatarChange(previewUrl, "upload");
      }
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        handleClose();
      }, 300);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const searchGifs = async () => {
    if (!gifSearchQuery.trim()) return;
    
    setIsLoadingGifs(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockGifs = Array.from({ length: 12 }, (_, i) => ({
        id: `gif-${i}`,
        url: `https://media.tenor.com/random-${i}.gif`,
        preview: `https://via.placeholder.com/150x150/0A1628/C8A661?text=GIF+${i + 1}`,
      }));
      
      setGifs(mockGifs);
    } catch (error) {
      console.error("Error searching GIFs:", error);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  const handleGifSelect = (gif: { id: string; url: string; preview: string }) => {
    setSelectedGif(gif.id);
    onAvatarChange(gif.preview, "tenor");
    handleClose();
  };

  const handleInitialsSelect = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      if (avatarStyle === "circle") {
        ctx.beginPath();
        ctx.arc(100, 100, 100, 0, Math.PI * 2);
        ctx.fillStyle = selectedColor.value;
        ctx.fill();
      } else {
        ctx.fillStyle = selectedColor.value;
        ctx.beginPath();
        ctx.roundRect(0, 0, 200, 200, 20);
        ctx.fill();
      }
      
      ctx.fillStyle = selectedColor.name === "gold" ? "#0A1628" : "#FFFFFF";
      ctx.font = "bold 72px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials, 100, 100);
      
      const dataUrl = canvas.toDataURL("image/png");
      onAvatarChange(dataUrl, "initials");
      handleClose();
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setUploadedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setGifSearchQuery("");
    setGifs([]);
    setSelectedGif(null);
    onClose();
  };

  const clearUpload = () => {
    setPreviewUrl(null);
    setUploadedFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col"
        data-testid="avatar-picker-dialog"
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#0A1628] flex items-center justify-center">
              <Camera className="h-4 w-4 text-[#C8A661]" />
            </div>
            Choose Your Avatar
          </DialogTitle>
          <DialogDescription>
            Express yourself with a custom avatar
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-[#C8A661]">
              <AvatarImage 
                src={previewUrl || currentAvatarUrl} 
                alt="Current avatar"
                data-testid="current-avatar-preview"
              />
              <AvatarFallback className="bg-[#0A1628] text-[#C8A661] text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#C8A661] flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-[#0A1628]" />
            </div>
          </div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger 
              value="upload" 
              className="gap-1.5"
              data-testid="tab-upload"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tenor" 
              className="gap-1.5"
              data-testid="tab-tenor"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">GIFs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="initials" 
              className="gap-1.5"
              data-testid="tab-initials"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Initials</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="upload" className="mt-0 h-full">
              <div className="space-y-4">
                {!previewUrl ? (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                      isDragActive
                        ? "border-[#C8A661] bg-[#C8A661]/10"
                        : "border-muted-foreground/30 hover:border-[#C8A661] hover:bg-muted/50"
                    )}
                    data-testid="upload-dropzone"
                  >
                    <input {...getInputProps()} data-testid="upload-input" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-[#0A1628] flex items-center justify-center">
                        <Upload className="h-6 w-6 text-[#C8A661]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {isDragActive ? "Drop your image here!" : "Drag & drop an image"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or click to browse (PNG, JPG, GIF up to 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border bg-muted/30">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        data-testid="upload-preview-image"
                      />
                      <button
                        onClick={clearUpload}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                        data-testid="button-clear-upload"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>

                    {isUploading && (
                      <div className="space-y-2" data-testid="upload-progress-container">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uploading...</span>
                          <span className="font-medium text-[#C8A661]">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}

                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                      data-testid="button-confirm-upload"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {isUploading ? "Uploading..." : "Use This Photo"}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tenor" className="mt-0 h-full">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for GIFs..."
                      value={gifSearchQuery}
                      onChange={(e) => setGifSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchGifs()}
                      className="pl-9"
                      data-testid="input-gif-search"
                    />
                  </div>
                  <Button 
                    onClick={searchGifs}
                    disabled={isLoadingGifs || !gifSearchQuery.trim()}
                    className="bg-[#C8A661] hover:bg-[#B8964F] text-[#0A1628]"
                    data-testid="button-search-gifs"
                  >
                    {isLoadingGifs ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>

                {isLoadingGifs ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#C8A661]" />
                  </div>
                ) : gifs.length > 0 ? (
                  <div 
                    className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1"
                    data-testid="gif-grid"
                  >
                    {gifs.map((gif) => (
                      <button
                        key={gif.id}
                        onClick={() => handleGifSelect(gif)}
                        onMouseEnter={() => setHoveredGif(gif.id)}
                        onMouseLeave={() => setHoveredGif(null)}
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                          selectedGif === gif.id
                            ? "border-[#C8A661] ring-2 ring-[#C8A661]/30"
                            : hoveredGif === gif.id
                            ? "border-[#C8A661]/50 scale-105"
                            : "border-transparent hover:border-muted-foreground/30"
                        )}
                        data-testid={`gif-option-${gif.id}`}
                      >
                        <img
                          src={gif.preview}
                          alt="GIF"
                          className="w-full h-full object-cover"
                        />
                        {hoveredGif === gif.id && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Badge className="bg-[#C8A661] text-[#0A1628]">
                              Select
                            </Badge>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Search for GIFs to get started</p>
                    <p className="text-sm mt-1">Try "happy", "cool", or "thumbs up"</p>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  Powered by Tenor
                </p>
              </div>
            </TabsContent>

            <TabsContent value="initials" className="mt-0 h-full">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div 
                    className={cn(
                      "h-24 w-24 flex items-center justify-center text-3xl font-bold transition-all",
                      avatarStyle === "circle" ? "rounded-full" : "rounded-xl"
                    )}
                    style={{ 
                      backgroundColor: selectedColor.value,
                      color: selectedColor.name === "gold" ? "#0A1628" : "#FFFFFF"
                    }}
                    data-testid="initials-preview"
                  >
                    {initials}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Background Color</label>
                  <div className="flex justify-center gap-3">
                    {AVATAR_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "h-10 w-10 rounded-full transition-all relative",
                          selectedColor.name === color.name
                            ? "ring-2 ring-offset-2 ring-[#C8A661]"
                            : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                        data-testid={`color-option-${color.name}`}
                      >
                        {selectedColor.name === color.name && (
                          <Check 
                            className={cn(
                              "h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                              color.name === "gold" ? "text-[#0A1628]" : "text-white"
                            )} 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Shape</label>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setAvatarStyle("circle")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                        avatarStyle === "circle"
                          ? "border-[#C8A661] bg-[#C8A661]/10 text-[#C8A661]"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50"
                      )}
                      data-testid="shape-circle"
                    >
                      <Circle className="h-4 w-4" />
                      Circle
                    </button>
                    <button
                      onClick={() => setAvatarStyle("rounded")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all",
                        avatarStyle === "rounded"
                          ? "border-[#C8A661] bg-[#C8A661]/10 text-[#C8A661]"
                          : "border-muted-foreground/30 hover:border-muted-foreground/50"
                      )}
                      data-testid="shape-rounded"
                    >
                      <Square className="h-4 w-4" />
                      Rounded
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleInitialsSelect}
                  className="w-full bg-[#0A1628] hover:bg-[#1a3a5c] text-white"
                  data-testid="button-use-initials"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Use This Avatar
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarPicker;
