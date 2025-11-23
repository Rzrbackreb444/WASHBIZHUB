import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { equipmentLibrary } from "@shared/schema";
import { Palette, Box, Plus, Save, Move } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function DesignStudio() {
  const [studioType, setStudioType] = useState<"2d" | "3d">("2d");
  const [dimensions, setDimensions] = useState({ width: 3600, depth: 2400 });
  const [placedEquipment, setPlacedEquipment] = useState<Array<{
    id: string;
    x: number;
    y: number;
    equipment: typeof equipmentLibrary[number];
  }>>([]);

  const totalCost = placedEquipment.reduce((sum, item) => sum + item.equipment.cost, 0);
  const totalTPD = placedEquipment.reduce((sum, item) => sum + item.equipment.tpdContribution, 0);

  const scaleFactor = 10; // 1 inch = 10 pixels

  const addEquipment = (equipment: typeof equipmentLibrary[number]) => {
    setPlacedEquipment([
      ...placedEquipment,
      {
        id: `${equipment.id}-${Date.now()}`,
        x: 100,
        y: 100,
        equipment,
      },
    ]);
  };

  return (
    <>
      <SEO 
        title="Design Studio | 2D/3D Laundromat Layout Designer" 
        description="Professional design studio for creating 2D and 3D laundromat floor plans. Drag-and-drop equipment library, real-time cost calculations, TPD analysis, and layout optimization."
        canonicalUrl="/design-studio"
        keywords={["design studio", "laundromat layout", "floor plan designer", "2D design", "3D design"]}
        ogType="website"
      />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <Palette className="h-16 w-16 text-accent mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white mb-4" data-testid="text-design-studio-title">
            Design Studio
          </h1>
          <p className="text-xl text-white/70" data-testid="text-design-studio-subtitle">
            Professional 2D/3D layout tools with equipment library
          </p>
        </div>

        <Tabs value={studioType} onValueChange={(v) => setStudioType(v as "2d" | "3d")} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/10">
            <TabsTrigger value="2d" data-testid="tab-2d">2D Studio</TabsTrigger>
            <TabsTrigger value="3d" data-testid="tab-3d">3D Studio (Pro)</TabsTrigger>
          </TabsList>

          <TabsContent value="2d">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Equipment Library Sidebar */}
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Equipment Library</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white/90 font-medium mb-2 block">Room Dimensions</Label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Width (inches)"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                        className="bg-white/20 border-white/30 text-white"
                        data-testid="input-room-width"
                      />
                      <Input
                        type="number"
                        placeholder="Depth (inches)"
                        value={dimensions.depth}
                        onChange={(e) => setDimensions({ ...dimensions, depth: parseInt(e.target.value) || 0 })}
                        className="bg-white/20 border-white/30 text-white"
                        data-testid="input-room-depth"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 font-medium mb-2 block">Add Equipment</Label>
                    <div className="space-y-2">
                      {equipmentLibrary.map((equipment) => (
                        <Button
                          key={equipment.id}
                          onClick={() => addEquipment(equipment)}
                          className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30"
                          variant="outline"
                          size="sm"
                          data-testid={`button-add-${equipment.id}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {equipment.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canvas Area */}
              <div className="md:col-span-3 space-y-4">
                <Card className="bg-white/10 backdrop-blur border-white/20">
                  <CardContent className="p-6">
                    <div className="bg-gray-900 rounded-xl p-8 min-h-[500px] relative border-2 border-dashed border-white/30" data-testid="canvas-2d-stage">
                      <div className="text-center text-white/70 absolute inset-0 flex items-center justify-center">
                        <div>
                          <Move className="h-16 w-16 mx-auto mb-4 text-accent" />
                          <p className="text-lg">2D Canvas View</p>
                          <p className="text-sm mt-2 text-white/50">
                            Room: {dimensions.width}" × {dimensions.depth}"
                          </p>
                          <p className="text-xs mt-4 text-white/50">
                            {placedEquipment.length} equipment item{placedEquipment.length !== 1 ? 's' : ''} placed
                          </p>
                        </div>
                      </div>
                      
                      {/* Equipment markers */}
                      {placedEquipment.map((item, index) => (
                        <div
                          key={item.id}
                          className="absolute bg-white/20 border border-accent rounded-md p-2 text-xs text-white"
                          style={{
                            left: `${(item.x / 700) * 100}%`,
                            top: `${(item.y / 500) * 100}%`,
                            backgroundColor: `${item.equipment.color}40`,
                            borderColor: item.equipment.color,
                          }}
                          data-testid={`equipment-marker-${index}`}
                        >
                          {item.equipment.name}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Total Cost</div>
                      <div className="text-2xl font-black text-accent" data-testid="metric-total-cost">
                        ${totalCost.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">Turns/Day</div>
                      <div className="text-2xl font-black text-accent" data-testid="metric-tpd">
                        {totalTPD}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 border-white/20">
                    <CardContent className="pt-6">
                      <div className="text-sm text-white/70 mb-1">AI Score</div>
                      <div className="text-2xl font-black text-accent" data-testid="metric-ai-score">
                        --
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  data-testid="button-save-design"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Design
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="3d">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-12 text-center">
                <Box className="h-24 w-24 text-accent mx-auto mb-6" />
                <h3 className="text-3xl font-black text-white mb-4">3D Studio (Pro)</h3>
                <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                  Experience our immersive 3D design studio with React Three Fiber, 
                  360° viewing, and real-time optimization. Available with Pro subscription.
                </p>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                    <div className="bg-white/5 p-4 rounded-md">
                      <h4 className="font-bold text-white mb-2">Interactive 3D</h4>
                      <p className="text-sm text-white/60">Rotate, zoom, and walk through your design</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-md">
                      <h4 className="font-bold text-white mb-2">Real-Time Metrics</h4>
                      <p className="text-sm text-white/60">See revenue calculations update live</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-md">
                      <h4 className="font-bold text-white mb-2">AI Optimization</h4>
                      <p className="text-sm text-white/60">Get AI-powered layout recommendations</p>
                    </div>
                  </div>
                  <Link href="/subscribe">
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg"
                      data-testid="button-upgrade-pro"
                    >
                      Upgrade to Pro - $97/month
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
