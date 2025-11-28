import { useState, useCallback, useRef, Suspense } from "react";
import { Link } from "wouter";
import { Rnd } from "react-rnd";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html, Text, Center, RoundedBox, Edges } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { equipmentLibrary } from "@shared/schema";
import { 
  Palette, Box, Plus, Save, Trash2, RotateCw, Grid3X3, 
  DollarSign, TrendingUp, Calculator, ZoomIn, ZoomOut,
  Download, Undo2, Info, Eye, Move3D, Maximize2, Camera,
  Sun, Moon, RotateCcw, Layers, Sparkles, Target, Zap, ChevronRight
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface PlacedEquipment {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  equipment: typeof equipmentLibrary[number];
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;
const SCALE_FACTOR = 0.15;
const SCALE_3D = 0.02;

function WasherModel({ position, color, capacity, isSelected, onClick }: { 
  position: [number, number, number]; 
  color: string; 
  capacity: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <RoundedBox
        ref={meshRef}
        args={[0.7, 1, 0.8]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        <Edges color={isSelected ? "#ffffff" : "#333333"} lineWidth={isSelected ? 3 : 1} />
      </RoundedBox>
      <RoundedBox
        position={[0, 0.1, 0.35]}
        args={[0.5, 0.5, 0.1]}
        radius={0.02}
      >
        <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <mesh position={[0, 0.1, 0.41]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 0.7, 0]} center distanceFactor={8}>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-bold">
          {capacity}
        </div>
      </Html>
    </group>
  );
}

function DryerModel({ position, color, capacity, isSelected, onClick }: { 
  position: [number, number, number]; 
  color: string; 
  capacity: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <RoundedBox
        ref={meshRef}
        args={[0.75, 1.1, 0.85]}
        radius={0.05}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
        <Edges color={isSelected ? "#ffffff" : "#333333"} lineWidth={isSelected ? 3 : 1} />
      </RoundedBox>
      <mesh position={[0, 0.05, 0.38]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.05, 0.40]}>
        <ringGeometry args={[0.22, 0.26, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
      <Html position={[0, 0.75, 0]} center distanceFactor={8}>
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-bold">
          {capacity}
        </div>
      </Html>
    </group>
  );
}

function FloorGrid() {
  return (
    <Grid
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#333333"
      sectionSize={2}
      sectionThickness={1}
      sectionColor="#555555"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      position={[0, -0.01, 0]}
    />
  );
}

function Scene3D({ 
  equipment, 
  selectedId, 
  onSelect,
  ambientIntensity,
  showLabels
}: { 
  equipment: PlacedEquipment[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ambientIntensity: number;
  showLabels: boolean;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        minDistance={3} 
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.1}
      />
      
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} />
      <pointLight position={[0, 8, 0]} intensity={0.6} />
      
      <FloorGrid />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      
      {equipment.map((item) => {
        const position: [number, number, number] = [
          (item.x - CANVAS_WIDTH / 2) * SCALE_3D,
          0.5,
          (item.y - CANVAS_HEIGHT / 2) * SCALE_3D
        ];
        
        const isWasher = item.equipment.type === "washer";
        const Model = isWasher ? WasherModel : DryerModel;
        
        return (
          <Model
            key={item.id}
            position={position}
            color={item.equipment.color}
            capacity={item.equipment.capacity}
            isSelected={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          />
        );
      })}
      
      <Environment preset="city" />
    </>
  );
}

export default function DesignStudio() {
  const { toast } = useToast();
  const [studioType, setStudioType] = useState<"2d" | "3d">("3d");
  const [dimensions, setDimensions] = useState({ width: 3600, depth: 2400 });
  const [placedEquipment, setPlacedEquipment] = useState<PlacedEquipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [ambientIntensity, setAmbientIntensity] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);

  const totalCost = placedEquipment.reduce((sum, item) => sum + item.equipment.cost, 0);
  const totalTPD = placedEquipment.reduce((sum, item) => sum + item.equipment.tpdContribution, 0);
  const washerCount = placedEquipment.filter(item => item.equipment.type === "washer").length;
  const dryerCount = placedEquipment.filter(item => item.equipment.type === "dryer").length;

  const avgVendPrice = 4.50;
  const dailyRevenue = totalTPD * avgVendPrice;
  const monthlyRevenue = dailyRevenue * 30;
  const annualRevenue = monthlyRevenue * 12;
  
  // CLEANBI Score calculation (40 base + equipment mix bonuses)
  const cleanbiScore = Math.min(100, 40 + 
    (washerCount * 4) + 
    (dryerCount * 3) + 
    (washerCount >= 4 && dryerCount >= 4 ? 10 : 0) + 
    (totalTPD >= 20 ? 8 : 0)
  );
  
  // Dynamic pricing potential (22% boost with peak-hour pricing)
  const dynamicPricingBoost = Math.round(monthlyRevenue * 0.22);
  const annualDynamicBoost = dynamicPricingBoost * 12;

  const addEquipment = useCallback((equipment: typeof equipmentLibrary[number]) => {
    const width = Math.round(equipment.width * SCALE_FACTOR);
    const height = Math.round(equipment.depth * SCALE_FACTOR);
    
    const offsetX = Math.random() * 100 - 50;
    const offsetY = Math.random() * 100 - 50;
    
    const newItem: PlacedEquipment = {
      id: `${equipment.id}-${Date.now()}`,
      x: CANVAS_WIDTH / 2 - width / 2 + offsetX,
      y: CANVAS_HEIGHT / 2 - height / 2 + offsetY,
      z: 0,
      width,
      height,
      depth: equipment.height * SCALE_FACTOR,
      rotation: 0,
      equipment,
    };
    
    setPlacedEquipment(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    
    toast({
      title: "Equipment Added",
      description: `${equipment.name} added to your design.`,
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "WashBizHub Design Studio",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "description": "Professional 2D and 3D laundromat floor plan designer with drag-and-drop equipment library, real-time cost calculations, and ROI projections.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "127"
    }
  };

  return (
    <>
      <SEO 
        title="3D Design Studio | Laundromat Layout Designer | WashBizHub" 
        description="Professional 2D and 3D laundromat floor plan designer. Drag-and-drop equipment from Dexter, Speed Queen, and more. Real-time cost calculations, TPD analysis, and ROI projections for your laundromat business."
        canonicalUrl="/design-studio"
        keywords={["laundromat design studio", "3D floor plan designer", "laundromat layout tool", "commercial laundry design", "equipment planning", "laundromat ROI calculator"]}
        ogType="website"
        structuredData={structuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-3 rounded-xl">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white" data-testid="text-design-studio-title">
                  Design Studio
                </h1>
                <p className="text-white/60 text-sm">
                  Professional 2D/3D layout designer with real-time ROI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
          </div>

          <Tabs value={studioType} onValueChange={(v) => setStudioType(v as "2d" | "3d")} className="mb-4">
            <TabsList className="grid w-full max-w-xs grid-cols-2 bg-white/10">
              <TabsTrigger value="2d" className="data-[state=active]:bg-white/20" data-testid="tab-2d">
                <Layers className="w-4 h-4 mr-2" />
                2D View
              </TabsTrigger>
              <TabsTrigger value="3d" className="data-[state=active]:bg-white/20" data-testid="tab-3d">
                <Move3D className="w-4 h-4 mr-2" />
                3D View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="3d" className="mt-4">
              <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" />
                      Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-white/80 text-xs mb-2 block">Room (ft)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="W"
                          value={Math.round(dimensions.width / 12)}
                          onChange={(e) => setDimensions({ ...dimensions, width: (parseInt(e.target.value) || 0) * 12 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-8"
                          data-testid="input-room-width"
                        />
                        <Input
                          type="number"
                          placeholder="D"
                          value={Math.round(dimensions.depth / 12)}
                          onChange={(e) => setDimensions({ ...dimensions, depth: (parseInt(e.target.value) || 0) * 12 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-8"
                          data-testid="input-room-depth"
                        />
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div>
                      <Label className="text-white/80 text-xs mb-2 block flex items-center gap-1">
                        <Sun className="h-3 w-3" />
                        Lighting
                      </Label>
                      <Slider
                        value={[ambientIntensity]}
                        onValueChange={([v]) => setAmbientIntensity(v)}
                        min={0.1}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <Separator className="bg-white/10" />

                    <ScrollArea className="h-[280px] pr-2">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-blue-400 mb-1">Washers</p>
                        {equipmentLibrary.filter(e => e.type === "washer").map((equipment) => (
                          <Button
                            key={equipment.id}
                            onClick={() => addEquipment(equipment)}
                            className="w-full justify-between bg-blue-500/10 hover:bg-blue-500/20 text-white border-blue-500/20 text-xs h-auto py-1.5 px-2"
                            variant="outline"
                            data-testid={`button-add-${equipment.id}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-2.5 h-2.5 rounded-sm" 
                                style={{ backgroundColor: equipment.color }}
                              />
                              <span className="truncate text-[11px]">{equipment.name}</span>
                            </div>
                            <Plus className="h-3 w-3 text-blue-400" />
                          </Button>
                        ))}
                        
                        <p className="text-xs font-medium text-orange-400 mb-1 mt-3">Dryers</p>
                        {equipmentLibrary.filter(e => e.type === "dryer").map((equipment) => (
                          <Button
                            key={equipment.id}
                            onClick={() => addEquipment(equipment)}
                            className="w-full justify-between bg-orange-500/10 hover:bg-orange-500/20 text-white border-orange-500/20 text-xs h-auto py-1.5 px-2"
                            variant="outline"
                            data-testid={`button-add-${equipment.id}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-2.5 h-2.5 rounded-sm" 
                                style={{ backgroundColor: equipment.color }}
                              />
                              <span className="truncate text-[11px]">{equipment.name}</span>
                            </div>
                            <Plus className="h-3 w-3 text-orange-400" />
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-white/70 border-white/20">
                        <Eye className="w-3 h-3 mr-1" />
                        Orbit to rotate • Scroll to zoom
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearCanvas}
                        className="h-7 text-red-400 border-red-400/30 hover:bg-red-400/10 text-xs"
                        data-testid="button-clear-canvas"
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Card className="bg-black/50 backdrop-blur border-white/10 overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="w-full h-[500px] relative"
                        data-testid="canvas-3d-stage"
                      >
                        <Canvas shadows>
                          <Suspense fallback={null}>
                            <Scene3D 
                              equipment={placedEquipment}
                              selectedId={selectedId}
                              onSelect={setSelectedId}
                              ambientIntensity={ambientIntensity}
                              showLabels={showLabels}
                            />
                          </Suspense>
                        </Canvas>
                        
                        {placedEquipment.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center text-white/40">
                              <Move3D className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-medium">Add equipment from the sidebar</p>
                              <p className="text-sm">Click equipment to add it to your 3D design</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedEquipment && (
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ backgroundColor: selectedEquipment.equipment.color }}
                            >
                              <span className="text-white text-[10px] font-bold">{selectedEquipment.equipment.capacity}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{selectedEquipment.equipment.name}</p>
                              <p className="text-white/60 text-xs">
                                ${selectedEquipment.equipment.cost.toLocaleString()} • {selectedEquipment.equipment.tpdContribution} TPD
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rotateEquipment(selectedId!)}
                              className="h-7 w-7 p-0"
                              data-testid="button-rotate"
                            >
                              <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeEquipment(selectedId!)}
                              className="h-7 w-7 p-0 text-red-400 border-red-400/30 hover:bg-red-400/10"
                              data-testid="button-delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Live Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                        <p className="text-xl font-black text-blue-400">{washerCount}</p>
                        <p className="text-[10px] text-white/60">Washers</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-2 text-center">
                        <p className="text-xl font-black text-orange-400">{dryerCount}</p>
                        <p className="text-[10px] text-white/60">Dryers</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Equipment</span>
                        <span className="text-white font-bold" data-testid="metric-total-cost">
                          ${totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Turns/Day</span>
                        <span className="text-white font-bold" data-testid="metric-tpd">
                          {totalTPD}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-white/80 text-xs font-medium">Revenue</span>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Daily</span>
                          <span className="text-green-400 font-medium">${dailyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Monthly</span>
                          <span className="text-green-400 font-medium">${monthlyRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Annual</span>
                          <span className="text-green-400 font-bold">${annualRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* CLEANBI Score */}
                    <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/30 rounded-lg p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="h-3 w-3 text-teal-400" />
                        <p className="text-[10px] text-teal-400 font-medium">CLEANBI Score</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <p className="text-xl font-black text-white">{cleanbiScore}</p>
                        <p className="text-white/60 text-xs">/100</p>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-teal-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${cleanbiScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Dynamic Pricing Boost */}
                    {monthlyRevenue > 0 && (
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Zap className="h-3 w-3 text-purple-400" />
                          <p className="text-[10px] text-purple-400 font-medium">AI Dynamic Pricing</p>
                        </div>
                        <p className="text-lg font-black text-white">
                          +${dynamicPricingBoost.toLocaleString()}<span className="text-white/60 text-xs">/mo</span>
                        </p>
                        <p className="text-[10px] text-white/50">+${annualDynamicBoost.toLocaleString()}/year with peak pricing</p>
                      </div>
                    )}

                    {totalCost > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                        <p className="text-[10px] text-primary font-medium mb-0.5">ROI Payback</p>
                        <p className="text-lg font-black text-white">
                          {monthlyRevenue > 0 ? Math.round(totalCost / monthlyRevenue) : '--'} months
                        </p>
                      </div>
                    )}

                    <Separator className="bg-white/10" />

                    {/* Launch in WashBizPOS CTA */}
                    {placedEquipment.length > 0 && (
                      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg p-3 text-center">
                        <p className="text-white font-bold text-sm mb-1">Ready to Launch?</p>
                        <p className="text-teal-100 text-[10px] mb-2">Pre-load your machines in WashBizPOS</p>
                        <Link href="/pricing">
                          <Button 
                            className="w-full h-8 bg-white text-teal-700 hover:bg-white/90 text-xs font-bold"
                            data-testid="button-launch-pos-trial"
                          >
                            Start 14-Day Free Trial
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      <Button 
                        className="w-full h-8 bg-primary hover:bg-primary/90 text-xs"
                        onClick={saveDesign}
                        data-testid="button-save-design"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save Design
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full h-8 text-xs"
                        data-testid="button-export-pdf"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="2d" className="mt-4">
              <div className="grid lg:grid-cols-5 gap-4">
                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" />
                      Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-white/80 text-xs mb-2 block">Room Size (ft)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Width"
                          value={Math.round(dimensions.width / 12)}
                          onChange={(e) => setDimensions({ ...dimensions, width: (parseInt(e.target.value) || 0) * 12 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-8"
                        />
                        <Input
                          type="number"
                          placeholder="Depth"
                          value={Math.round(dimensions.depth / 12)}
                          onChange={(e) => setDimensions({ ...dimensions, depth: (parseInt(e.target.value) || 0) * 12 })}
                          className="bg-white/10 border-white/20 text-white text-sm h-8"
                        />
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <ScrollArea className="h-[320px] pr-2">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-blue-400 mb-1">Washers</p>
                        {equipmentLibrary.filter(e => e.type === "washer").map((equipment) => (
                          <Button
                            key={equipment.id}
                            onClick={() => addEquipment(equipment)}
                            className="w-full justify-between bg-blue-500/10 hover:bg-blue-500/20 text-white border-blue-500/20 text-xs h-auto py-1.5"
                            variant="outline"
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm" 
                                style={{ backgroundColor: equipment.color }}
                              />
                              <span className="truncate">{equipment.name}</span>
                            </div>
                            <Plus className="h-3 w-3" />
                          </Button>
                        ))}
                        
                        <p className="text-xs font-medium text-orange-400 mb-1 mt-3">Dryers</p>
                        {equipmentLibrary.filter(e => e.type === "dryer").map((equipment) => (
                          <Button
                            key={equipment.id}
                            onClick={() => addEquipment(equipment)}
                            className="w-full justify-between bg-orange-500/10 hover:bg-orange-500/20 text-white border-orange-500/20 text-xs h-auto py-1.5"
                            variant="outline"
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm" 
                                style={{ backgroundColor: equipment.color }}
                              />
                              <span className="truncate">{equipment.name}</span>
                            </div>
                            <Plus className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <div className="lg:col-span-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={showGrid ? "default" : "outline"}
                        onClick={() => setShowGrid(!showGrid)}
                        className="h-7 text-xs"
                      >
                        <Grid3X3 className="h-3 w-3 mr-1" />
                        Grid
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
                        className="h-7 w-7 p-0"
                      >
                        <ZoomIn className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                        className="h-7 w-7 p-0"
                      >
                        <ZoomOut className="h-3 w-3" />
                      </Button>
                      <span className="text-white/50 text-xs">{Math.round(zoom * 100)}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearCanvas}
                      className="h-7 text-red-400 border-red-400/30 hover:bg-red-400/10 text-xs"
                    >
                      <Undo2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
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
                                <Layers className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Add equipment from the sidebar</p>
                                <p className="text-sm">Click equipment to place it on the canvas</p>
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
                      <CardContent className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ backgroundColor: selectedEquipment.equipment.color }}
                            >
                              <span className="text-white text-[10px] font-bold">{selectedEquipment.equipment.capacity}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">{selectedEquipment.equipment.name}</p>
                              <p className="text-white/60 text-xs">
                                ${selectedEquipment.equipment.cost.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rotateEquipment(selectedId!)}
                              className="h-7 w-7 p-0"
                            >
                              <RotateCw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeEquipment(selectedId!)}
                              className="h-7 w-7 p-0 text-red-400 border-red-400/30 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Card className="lg:col-span-1 bg-white/5 backdrop-blur border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                        <p className="text-xl font-black text-blue-400">{washerCount}</p>
                        <p className="text-[10px] text-white/60">Washers</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-2 text-center">
                        <p className="text-xl font-black text-orange-400">{dryerCount}</p>
                        <p className="text-[10px] text-white/60">Dryers</p>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Equipment</span>
                        <span className="text-white font-bold">${totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">Turns/Day</span>
                        <span className="text-white font-bold">{totalTPD}</span>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    <div className="bg-green-500/10 rounded-lg p-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Monthly</span>
                        <span className="text-green-400 font-medium">${monthlyRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Annual</span>
                        <span className="text-green-400 font-bold">${annualRevenue.toLocaleString()}</span>
                      </div>
                    </div>

                    {totalCost > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                        <p className="text-[10px] text-primary font-medium">Payback</p>
                        <p className="text-lg font-black text-white">
                          {monthlyRevenue > 0 ? Math.round(totalCost / monthlyRevenue) : '--'} mo
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Button 
                        className="w-full h-8 bg-primary hover:bg-primary/90 text-xs"
                        onClick={saveDesign}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full h-8 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
