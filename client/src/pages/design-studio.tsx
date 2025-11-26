import { useState, useCallback } from "react";
import { Link } from "wouter";
import { Rnd } from "react-rnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { equipmentLibrary } from "@shared/schema";
import { 
  Palette, Box, Plus, Save, Trash2, RotateCw, Grid3X3, 
  DollarSign, TrendingUp, Calculator, ZoomIn, ZoomOut,
  Download, Undo2, Info
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface PlacedEquipment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  equipment: typeof equipmentLibrary[number];
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const SCALE_FACTOR = 0.15;

export default function DesignStudio() {
  const { toast } = useToast();
  const [studioType, setStudioType] = useState<"2d" | "3d">("2d");
  const [dimensions, setDimensions] = useState({ width: 3600, depth: 2400 });
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

  const totalCost = placedEquipment.reduce((sum, item) => sum + item.equipment.cost, 0);
  const totalTPD = placedEquipment.reduce((sum, item) => sum + item.equipment.tpdContribution, 0);
  const washerCount = placedEquipment.filter(item => item.equipment.type === "washer").length;
  const dryerCount = placedEquipment.filter(item => item.equipment.type === "dryer").length;

  const avgVendPrice = 4.50;
  const dailyRevenue = totalTPD * avgVendPrice;
  const monthlyRevenue = dailyRevenue * 30;
  const annualRevenue = monthlyRevenue * 12;

  const addEquipment = useCallback((equipment: typeof equipmentLibrary[number]) => {
    const width = Math.round(equipment.width * SCALE_FACTOR);
    const height = Math.round(equipment.depth * SCALE_FACTOR);
    
    const newItem: PlacedEquipment = {
      id: `${equipment.id}-${Date.now()}`,
      x: CANVAS_WIDTH / 2 - width / 2,
      y: CANVAS_HEIGHT / 2 - height / 2,
      width,
      height,
      rotation: 0,
      equipment,
    };
    
    setPlacedEquipment(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    
    toast({
      title: "Equipment Added",
      description: `${equipment.name} added to canvas. Drag to position.`,
    });
  }, [toast]);

  const removeEquipment = useCallback((id: string) => {
    setPlacedEquipment(prev => prev.filter(item => item.id !== id));
    setSelectedId(null);
    toast({
      title: "Equipment Removed",
      description: "Equipment removed from design.",
    });
  }, [toast]);

  const rotateEquipment = useCallback((id: string) => {
    setPlacedEquipment(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          rotation: (item.rotation + 90) % 360,
          width: item.height,
          height: item.width,
        };
      }
      return item;
    }));
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    const snappedX = showGrid ? Math.round(x / GRID_SIZE) * GRID_SIZE : x;
    const snappedY = showGrid ? Math.round(y / GRID_SIZE) * GRID_SIZE : y;
    
    setPlacedEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, x: snappedX, y: snappedY } : item
    ));
  }, [showGrid]);

  const clearCanvas = useCallback(() => {
    setPlacedEquipment([]);
    setSelectedId(null);
    toast({
      title: "Canvas Cleared",
      description: "All equipment has been removed.",
    });
  }, [toast]);

  const saveDesign = useCallback(() => {
    const design = {
      dimensions,
      equipment: placedEquipment,
      totalCost,
      totalTPD,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('washbizhub-design', JSON.stringify(design));
    toast({
      title: "Design Saved",
      description: "Your design has been saved locally.",
    });
  }, [dimensions, placedEquipment, totalCost, totalTPD, toast]);

  const selectedEquipment = placedEquipment.find(item => item.id === selectedId);

  return (
    <>
      <SEO 
        title="Design Studio | 2D Laundromat Layout Designer" 
        description="Professional design studio for creating laundromat floor plans. Drag-and-drop equipment library, real-time cost calculations, TPD analysis, and revenue projections."
        canonicalUrl="/design-studio"
        keywords={["design studio", "laundromat layout", "floor plan designer", "2D design", "laundromat planning"]}
        ogType="website"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Palette className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-black text-white" data-testid="text-design-studio-title">
                Design Studio
              </h1>
            </div>
            <p className="text-lg text-white/70" data-testid="text-design-studio-subtitle">
              Drag-and-drop layout designer with real-time ROI calculations
            </p>
          </div>

          <Tabs value={studioType} onValueChange={(v) => setStudioType(v as "2d" | "3d")} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/10">
              <TabsTrigger value="2d" data-testid="tab-2d">2D Studio</TabsTrigger>
              <TabsTrigger value="3d" data-testid="tab-3d">3D Studio (Pro)</TabsTrigger>
            </TabsList>

            <TabsContent value="2d" className="mt-6">
              <div className="grid lg:grid-cols-5 gap-6">
                
                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" />
                      Equipment Library
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white/80 text-xs mb-2 block">Room Size (inches)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Width"
                          value={dimensions.width}
                          onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-9"
                          data-testid="input-room-width"
                        />
                        <Input
                          type="number"
                          placeholder="Depth"
                          value={dimensions.depth}
                          onChange={(e) => setDimensions({ ...dimensions, depth: parseInt(e.target.value) || 0 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-9"
                          data-testid="input-room-depth"
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        {Math.round(dimensions.width / 12)}' × {Math.round(dimensions.depth / 12)}' = {Math.round((dimensions.width * dimensions.depth) / 144)} sq ft
                      </p>
                    </div>

                    <Separator className="bg-white/10" />

                    <ScrollArea className="h-[350px] pr-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-primary mb-2">Washers</p>
                          {equipmentLibrary.filter(e => e.type === "washer").map((equipment) => (
                            <Button
                              key={equipment.id}
                              onClick={() => addEquipment(equipment)}
                              className="w-full justify-between mb-2 bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-500/30 text-xs h-auto py-2"
                              variant="outline"
                              data-testid={`button-add-${equipment.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ backgroundColor: equipment.color }}
                                />
                                <span className="truncate">{equipment.name}</span>
                              </div>
                              <span className="text-white/60">${equipment.cost.toLocaleString()}</span>
                            </Button>
                          ))}
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-orange-400 mb-2">Dryers</p>
                          {equipmentLibrary.filter(e => e.type === "dryer").map((equipment) => (
                            <Button
                              key={equipment.id}
                              onClick={() => addEquipment(equipment)}
                              className="w-full justify-between mb-2 bg-orange-500/20 hover:bg-orange-500/30 text-white border-orange-500/30 text-xs h-auto py-2"
                              variant="outline"
                              data-testid={`button-add-${equipment.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-sm" 
                                  style={{ backgroundColor: equipment.color }}
                                />
                                <span className="truncate">{equipment.name}</span>
                              </div>
                              <span className="text-white/60">${equipment.cost.toLocaleString()}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={showGrid ? "default" : "outline"}
                        onClick={() => setShowGrid(!showGrid)}
                        className="h-8"
                        data-testid="button-toggle-grid"
                      >
                        <Grid3X3 className="h-4 w-4 mr-1" />
                        Grid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
                        className="h-8"
                        data-testid="button-zoom-in"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                        className="h-8"
                        data-testid="button-zoom-out"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-white/50 text-sm ml-2">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearCanvas}
                        className="h-8 text-red-400 border-red-400/30 hover:bg-red-400/10"
                        data-testid="button-clear-canvas"
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-white/5 backdrop-blur border-white/10 overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="relative overflow-hidden"
                        style={{ 
                          width: '100%',
                          height: CANVAS_HEIGHT * zoom,
                          background: '#1a1a2e'
                        }}
                        data-testid="canvas-2d-stage"
                      >
                        <div
                          style={{
                            width: CANVAS_WIDTH,
                            height: CANVAS_HEIGHT,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            position: 'relative',
                          }}
                        >
                          {showGrid && (
                            <svg 
                              className="absolute inset-0 pointer-events-none" 
                              width={CANVAS_WIDTH} 
                              height={CANVAS_HEIGHT}
                            >
                              <defs>
                                <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                          )}

                          {placedEquipment.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-white/30">
                              <div className="text-center">
                                <Box className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Add equipment from the library</p>
                                <p className="text-sm">Click any item to place it on the canvas</p>
                              </div>
                            </div>
                          )}

                          {placedEquipment.map((item) => (
                            <Rnd
                              key={item.id}
                              position={{ x: item.x, y: item.y }}
                              size={{ width: item.width, height: item.height }}
                              onDragStop={(e, d) => updatePosition(item.id, d.x, d.y)}
                              onClick={() => setSelectedId(item.id)}
                              bounds="parent"
                              enableResizing={false}
                              className="group"
                            >
                              <div
                                className={`w-full h-full rounded-sm flex items-center justify-center cursor-move transition-all ${
                                  selectedId === item.id 
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' 
                                    : 'hover:ring-1 hover:ring-white/50'
                                }`}
                                style={{ 
                                  backgroundColor: item.equipment.color,
                                  transform: `rotate(${item.rotation}deg)`,
                                }}
                                data-testid={`equipment-${item.id}`}
                              >
                                <span 
                                  className="text-white text-[8px] font-bold text-center leading-tight px-0.5 select-none"
                                  style={{ transform: `rotate(-${item.rotation}deg)` }}
                                >
                                  {item.equipment.capacity}
                                </span>
                              </div>
                            </Rnd>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedEquipment && (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded flex items-center justify-center"
                              style={{ backgroundColor: selectedEquipment.equipment.color }}
                            >
                              <span className="text-white text-xs font-bold">{selectedEquipment.equipment.capacity}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{selectedEquipment.equipment.name}</p>
                              <p className="text-white/60 text-xs">
                                {selectedEquipment.equipment.width}" × {selectedEquipment.equipment.depth}" • ${selectedEquipment.equipment.cost.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rotateEquipment(selectedId!)}
                              className="h-8"
                              data-testid="button-rotate"
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeEquipment(selectedId!)}
                              className="h-8 text-red-400 border-red-400/30 hover:bg-red-400/10"
                              data-testid="button-delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Live Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-blue-400">{washerCount}</p>
                        <p className="text-xs text-white/60">Washers</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-black text-orange-400">{dryerCount}</p>
                        <p className="text-xs text-white/60">Dryers</p>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Equipment Cost</span>
                        <span className="text-white font-bold" data-testid="metric-total-cost">
                          ${totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">Turns/Day</span>
                        <span className="text-white font-bold" data-testid="metric-tpd">
                          {totalTPD}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-white/80 text-sm font-medium">Revenue Projections</span>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Daily</span>
                          <span className="text-green-400 font-medium">${dailyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Monthly</span>
                          <span className="text-green-400 font-medium">${monthlyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Annual</span>
                          <span className="text-green-400 font-bold">${annualRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Based on ${avgVendPrice.toFixed(2)} avg vend
                      </p>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={saveDesign}
                        data-testid="button-save-design"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Design
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        data-testid="button-export-pdf"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </div>

                    {totalCost > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <p className="text-xs text-primary font-medium mb-1">ROI Estimate</p>
                        <p className="text-lg font-black text-white">
                          {monthlyRevenue > 0 ? Math.round(totalCost / monthlyRevenue) : '--'} months
                        </p>
                        <p className="text-[10px] text-white/50">Payback period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="3d">
              <Card className="bg-white/5 backdrop-blur border-white/10">
                <CardContent className="p-12 text-center">
                  <Box className="h-24 w-24 text-primary mx-auto mb-6" />
                  <h3 className="text-3xl font-black text-white mb-4">3D Studio (Pro)</h3>
                  <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                    Experience our immersive 3D design studio with 360° viewing, 
                    walk-through mode, and AI-powered layout optimization.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Interactive 3D</h4>
                      <p className="text-sm text-white/60">Rotate, zoom, and walk through your design</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">Real-Time Metrics</h4>
                      <p className="text-sm text-white/60">See revenue calculations update live</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-bold text-white mb-2">AI Optimization</h4>
                      <p className="text-sm text-white/60">Get AI-powered layout recommendations</p>
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button 
                      className="bg-primary hover:bg-primary/90 font-bold px-8 py-6 text-lg"
                      data-testid="button-upgrade-pro"
                    >
                      Upgrade to Pro
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
