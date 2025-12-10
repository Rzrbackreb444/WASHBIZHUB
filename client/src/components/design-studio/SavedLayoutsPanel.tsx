import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Share2,
  Download,
  Plus,
  Clock,
  Layers,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

interface SavedLayout {
  id: string;
  name: string;
  dimensions: { width: number; depth: number };
  equipment: Array<{
    equipmentId: string;
    x: number;
    y: number;
    rotation: number;
  }>;
  address?: string;
  createdAt: string;
  updatedAt: string;
  totalCost: number;
  monthlyRevenue: number;
}

interface SavedLayoutsPanelProps {
  currentDimensions: { width: number; depth: number };
  currentEquipment: Array<{
    id: string;
    x: number;
    y: number;
    rotation: number;
    equipment: { id: string; cost: number };
  }>;
  onLoadLayout: (layout: SavedLayout) => void;
  locationAddress?: string;
}

const STORAGE_KEY = "washbizhub-saved-layouts";

export function SavedLayoutsPanel({
  currentDimensions,
  currentEquipment,
  onLoadLayout,
  locationAddress
}: SavedLayoutsPanelProps) {
  const { toast } = useToast();
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedLayouts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved layouts:", e);
      }
    }
  }, []);

  const saveLayout = () => {
    if (!layoutName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your layout.",
        variant: "destructive"
      });
      return;
    }

    const totalCost = currentEquipment.reduce((sum, item) => sum + item.equipment.cost, 0);
    const monthlyRevenue = currentEquipment.length * 350;

    const newLayout: SavedLayout = {
      id: `layout-${Date.now()}`,
      name: layoutName.trim(),
      dimensions: { ...currentDimensions },
      equipment: currentEquipment.map(e => ({
        equipmentId: e.equipment.id,
        x: e.x,
        y: e.y,
        rotation: e.rotation
      })),
      address: locationAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalCost,
      monthlyRevenue
    };

    const updated = [newLayout, ...savedLayouts];
    setSavedLayouts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    setLayoutName("");
    setSaveDialogOpen(false);
    
    toast({
      title: "Layout Saved",
      description: `"${newLayout.name}" has been saved successfully.`
    });
  };

  const deleteLayout = (id: string) => {
    const updated = savedLayouts.filter(l => l.id !== id);
    setSavedLayouts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    toast({
      title: "Layout Deleted",
      description: "The layout has been removed."
    });
  };

  const duplicateLayout = (layout: SavedLayout) => {
    const duplicated: SavedLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
      name: `${layout.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [duplicated, ...savedLayouts];
    setSavedLayouts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    toast({
      title: "Layout Duplicated",
      description: `"${duplicated.name}" has been created.`
    });
  };

  const generateShareLink = (layout: SavedLayout) => {
    const encodedData = btoa(JSON.stringify({
      name: layout.name,
      dimensions: layout.dimensions,
      equipment: layout.equipment
    }));
    const url = `${window.location.origin}/design-studio?layout=${encodedData}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Share Link Copied",
      description: "The layout share link has been copied to your clipboard."
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const sqFt = Math.round((currentDimensions.width * currentDimensions.depth) / 144);

  return (
    <Card className="bg-gradient-to-br from-[#001F3F] to-[#002850] border-amber-500/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <FolderOpen className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-lg">Saved Layouts</span>
          </div>
          <Badge className="bg-white/10 text-white/60">{savedLayouts.length}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
              disabled={currentEquipment.length === 0}
              data-testid="button-save-layout"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Layout
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#001F3F] border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Save className="h-5 w-5 text-amber-400" />
                Save Layout
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Save your current floor plan design for future reference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-white/80">Layout Name</Label>
                <Input
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="My Laundromat Design"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  data-testid="input-layout-name"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Dimensions</span>
                  <span className="text-white">
                    {Math.round(currentDimensions.width / 12)}' × {Math.round(currentDimensions.depth / 12)}' ({sqFt.toLocaleString()} sq ft)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Equipment</span>
                  <span className="text-white">{currentEquipment.length} pieces</span>
                </div>
                {locationAddress && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Location</span>
                    <span className="text-white text-xs truncate max-w-[180px]">{locationAddress}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1 border-white/20 text-white/70">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={saveLayout}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black"
                  data-testid="button-confirm-save"
                >
                  Save Layout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Separator className="bg-white/10" />

        {savedLayouts.length === 0 ? (
          <div className="text-center py-6">
            <Layers className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No saved layouts yet</p>
            <p className="text-white/30 text-xs mt-1">
              Design a floor plan and save it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {savedLayouts.map((layout) => {
                const layoutSqFt = Math.round((layout.dimensions.width * layout.dimensions.depth) / 144);
                return (
                  <div
                    key={layout.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-amber-500/30 transition-colors"
                    data-testid={`saved-layout-${layout.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm truncate">{layout.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 text-[10px] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(layout.updatedAt)}
                          </span>
                          {layout.address && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px]">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                              Location
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mb-3 text-[10px]">
                      <div className="bg-black/20 rounded p-1.5 text-center">
                        <p className="text-white/50">Size</p>
                        <p className="text-white font-medium">{layoutSqFt.toLocaleString()} sqft</p>
                      </div>
                      <div className="bg-black/20 rounded p-1.5 text-center">
                        <p className="text-white/50">Equipment</p>
                        <p className="text-white font-medium">{layout.equipment.length} pcs</p>
                      </div>
                      <div className="bg-black/20 rounded p-1.5 text-center">
                        <p className="text-white/50">Revenue</p>
                        <p className="text-green-400 font-medium">${(layout.monthlyRevenue / 1000).toFixed(1)}K</p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => onLoadLayout(layout)}
                        className="flex-1 h-7 bg-amber-500 hover:bg-amber-600 text-black text-[10px]"
                        data-testid={`button-load-layout-${layout.id}`}
                      >
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Load
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => duplicateLayout(layout)}
                        className="h-7 w-7 border-white/20 text-white/60 hover:text-white"
                        data-testid={`button-duplicate-layout-${layout.id}`}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => generateShareLink(layout)}
                        className="h-7 w-7 border-white/20 text-white/60 hover:text-white"
                        data-testid={`button-share-layout-${layout.id}`}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => deleteLayout(layout.id)}
                        className="h-7 w-7 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        data-testid={`button-delete-layout-${layout.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
