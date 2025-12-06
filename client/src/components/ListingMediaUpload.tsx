import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ImagePlus, X, Upload, Video, FileText, 
  GripVertical, Star, Trash2, Loader2, Lock, Eye, EyeOff
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ListingMedia } from '@shared/schema';

interface ListingMediaUploadProps {
  listingId: string;
  onFeaturedImageChange?: (url: string) => void;
}

export function ListingMediaUpload({ listingId, onFeaturedImageChange }: ListingMediaUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: media = [], isLoading } = useQuery<ListingMedia[]>({
    queryKey: ['/api/listings', listingId, 'media'],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${listingId}/media`);
      if (!res.ok) throw new Error('Failed to fetch media');
      return res.json();
    },
    enabled: !!listingId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      // Use direct server-side upload to bypass CORS issues with signed URLs
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('sortOrder', String(media.length));
      formData.append('requiresNDA', 'false');
      
      const uploadRes = await fetch(`/api/listings/${listingId}/media/upload-direct`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ message: 'Upload failed' }));
        console.error('Upload error:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to upload file');
      }
      
      const result = await uploadRes.json();
      console.log('Upload success:', result);
      return result.media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId, 'media'] });
      toast({
        title: 'Media uploaded',
        description: 'Your file has been uploaded successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Upload mutation error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      await apiRequest(`/api/listings/${listingId}/media/${mediaId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId, 'media'] });
      toast({
        title: 'Media deleted',
        description: 'The file has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (mediaIds: string[]) => {
      await apiRequest(`/api/listings/${listingId}/media/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ mediaIds }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId, 'media'] });
    },
  });

  const setFeaturedMutation = useMutation({
    mutationFn: async (mediaUrl: string) => {
      await apiRequest(`/api/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ featuredImage: mediaUrl }),
      });
      return mediaUrl;
    },
    onSuccess: (url) => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId] });
      onFeaturedImageChange?.(url);
      toast({
        title: 'Featured image updated',
        description: 'The listing thumbnail has been changed.',
      });
    },
  });

  const toggleNDAMutation = useMutation({
    mutationFn: async ({ mediaId, requiresNDA }: { mediaId: string; requiresNDA: boolean }) => {
      await apiRequest(`/api/listings/${listingId}/media/${mediaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ requiresNDA }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings', listingId, 'media'] });
      toast({
        title: 'Privacy updated',
        description: 'Media visibility has been changed.',
      });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex(m => m.id === active.id);
      const newIndex = media.findIndex(m => m.id === over.id);
      const newOrder = arrayMove(media, oldIndex, newIndex);
      reorderMutation.mutate(newOrder.map(m => m.id));
    }
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('video/') ? 'video' 
        : file.type === 'application/pdf' ? 'document' 
        : 'image';
      
      try {
        await uploadMutation.mutateAsync({ file, type });
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    e.target.value = '';
  }, [uploadMutation]);

  const images = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');
  const documents = media.filter(m => m.type === 'document' || m.type === 'floor_plan');

  return (
    <Card data-testid="card-listing-media-upload">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Listing Media
            </CardTitle>
            <CardDescription>
              Upload photos, videos, and documents. Drag to reorder. First image is the thumbnail.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{images.length} images</Badge>
            {videos.length > 0 && <Badge variant="outline">{videos.length} videos</Badge>}
            {documents.length > 0 && <Badge variant="outline">{documents.length} docs</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative"
            onClick={() => document.getElementById('media-upload-input')?.click()}
          >
            <input
              id="media-upload-input"
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-media-upload"
            />
            
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
                <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Click to upload or drag files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Photos (JPG, PNG, WebP), Videos (MP4, MOV), Documents (PDF) • Max 20MB each
                </p>
              </>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Photos</h4>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map(m => m.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((item, index) => (
                      <SortableMediaItem
                        key={item.id}
                        item={item}
                        isFirst={index === 0}
                        onDelete={() => deleteMutation.mutate(item.id)}
                        onSetFeatured={() => setFeaturedMutation.mutate(item.url)}
                        onToggleNDA={() => toggleNDAMutation.mutate({ 
                          mediaId: item.id, 
                          requiresNDA: !item.requiresNDA 
                        })}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {videos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Videos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {videos.map(item => (
                  <MediaItem
                    key={item.id}
                    item={item}
                    onDelete={() => deleteMutation.mutate(item.id)}
                    onToggleNDA={() => toggleNDAMutation.mutate({ 
                      mediaId: item.id, 
                      requiresNDA: !item.requiresNDA 
                    })}
                  />
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Documents</h4>
              <div className="space-y-2">
                {documents.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.title || item.filename}</p>
                        <div className="flex items-center gap-2">
                          {item.requiresNDA && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              NDA Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleNDAMutation.mutate({ 
                          mediaId: item.id, 
                          requiresNDA: !item.requiresNDA 
                        })}
                        title={item.requiresNDA ? 'Make public' : 'Require NDA'}
                      >
                        {item.requiresNDA ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableMediaItemProps {
  item: ListingMedia;
  isFirst: boolean;
  onDelete: () => void;
  onSetFeatured: () => void;
  onToggleNDA: () => void;
}

function SortableMediaItem({ item, isFirst, onDelete, onSetFeatured, onToggleNDA }: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden group bg-muted ${
        isDragging ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      data-testid={`media-item-${item.id}`}
    >
      <img
        src={item.url}
        alt={item.title || 'Listing photo'}
        className="w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
      
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {isFirst && (
        <div className="absolute top-2 left-10 bg-[#D4AF37] text-[#001F3F] px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1">
          <Star className="w-3 h-3" />
          Featured
        </div>
      )}

      {item.requiresNDA && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded">
          <Lock className="w-3 h-3" />
        </div>
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isFirst && (
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={onSetFeatured}
            title="Set as featured image"
          >
            <Star className="w-4 h-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={onToggleNDA}
          title={item.requiresNDA ? 'Make public' : 'Require NDA'}
        >
          {item.requiresNDA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface MediaItemProps {
  item: ListingMedia;
  onDelete: () => void;
  onToggleNDA: () => void;
}

function MediaItem({ item, onDelete, onToggleNDA }: MediaItemProps) {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden group bg-muted">
      {item.type === 'video' ? (
        <video
          src={item.url}
          className="w-full h-full object-cover"
          controls
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      
      {item.requiresNDA && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1.5 rounded">
          <Lock className="w-3 h-3" />
        </div>
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={onToggleNDA}
          title={item.requiresNDA ? 'Make public' : 'Require NDA'}
        >
          {item.requiresNDA ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={onDelete}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
