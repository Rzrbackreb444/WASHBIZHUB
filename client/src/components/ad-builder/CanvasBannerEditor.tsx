import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Download, Copy, Settings, Type, Image as ImageIcon, Trash2, Lock, Unlock } from 'lucide-react';

interface BannerElement {
  id: string;
  type: 'text' | 'logo' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  zIndex: number;
}

interface BannerDesign {
  id: string;
  width: number;
  height: number;
  bgColor: string;
  elements: BannerElement[];
  template: 'horizontal' | 'vertical' | 'square';
}

const BANNER_TEMPLATES = {
  horizontal: { width: 1200, height: 300, name: 'Horizontal (1200x300)' },
  vertical: { width: 300, height: 600, name: 'Vertical (300x600)' },
  square: { width: 500, height: 500, name: 'Square (500x500)' },
};

export function CanvasBannerEditor({ templateType = 'horizontal', onSave }: { templateType?: 'horizontal' | 'vertical' | 'square'; onSave?: (design: BannerDesign) => void }) {
  const [design, setDesign] = useState<BannerDesign>({
    id: 'banner-' + Date.now(),
    ...BANNER_TEMPLATES[templateType],
    bgColor: '#ffffff',
    elements: [],
    template: templateType,
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addText = () => {
    const newElement: BannerElement = {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 50,
      y: 50,
      width: 400,
      height: 60,
      content: 'Click to edit text',
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Inter',
      zIndex: design.elements.length,
    };
    setDesign(d => ({ ...d, elements: [...d.elements, newElement] }));
    setSelectedElement(newElement.id);
  };

  const addLogo = () => {
    const newElement: BannerElement = {
      id: 'logo-' + Date.now(),
      type: 'logo',
      x: 20,
      y: 20,
      width: 80,
      height: 80,
      content: 'https://via.placeholder.com/80',
      zIndex: design.elements.length,
    };
    setDesign(d => ({ ...d, elements: [...d.elements, newElement] }));
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<BannerElement>) => {
    setDesign(d => ({
      ...d,
      elements: d.elements.map(el => el.id === id ? { ...el, ...updates } : el),
    }));
  };

  const deleteElement = (id: string) => {
    setDesign(d => ({
      ...d,
      elements: d.elements.filter(el => el.id !== id),
    }));
    setSelectedElement(null);
  };

  const selected = design.elements.find(el => el.id === selectedElement);

  const exportAsImage = () => {
    if (canvasRef.current) {
      const svg = canvasRef.current.innerHTML;
      console.log('Exporting banner SVG:', svg);
      // In production, use html2canvas to export as PNG
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Canvas</CardTitle>
            <CardDescription>Drag elements to arrange, click to select</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Banner Canvas */}
            <div
              ref={canvasRef}
              className="relative mx-auto bg-white border-2 border-slate-300 cursor-move select-none"
              style={{
                width: `${design.width / 4}px`,
                height: `${design.height / 4}px`,
                backgroundColor: design.bgColor,
                aspectRatio: `${design.width} / ${design.height}`,
              }}
            >
              {design.elements.map(element => (
                <div
                  key={element.id}
                  onClick={() => setSelectedElement(element.id)}
                  className={`absolute cursor-pointer group ${selectedElement === element.id ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-400'}`}
                  style={{
                    left: `${(element.x / design.width) * 100}%`,
                    top: `${(element.y / design.height) * 100}%`,
                    width: `${(element.width / design.width) * 100}%`,
                    height: `${(element.height / design.height) * 100}%`,
                    zIndex: element.zIndex,
                  }}
                >
                  {element.type === 'text' && (
                    <div
                      className="w-full h-full flex items-center justify-center p-1 overflow-hidden"
                      style={{
                        fontSize: `${(element.fontSize || 24) / 4}px`,
                        color: element.color,
                        fontFamily: element.fontFamily,
                        textAlign: 'center',
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                  {element.type === 'logo' && (
                    <img
                      src={element.content}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Panel */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={addText} className="w-full" variant="outline" data-testid="button-add-text">
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </Button>
            <Button onClick={addLogo} className="w-full" variant="outline" data-testid="button-add-logo">
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Logo/Image
            </Button>
            <Button onClick={exportAsImage} className="w-full" variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export as PNG
            </Button>
          </CardContent>
        </Card>

        {/* Properties */}
        {selected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Properties</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteElement(selected.id)}
                  data-testid="button-delete-element"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Position</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">X</label>
                    <Input
                      type="number"
                      value={Math.round(selected.x)}
                      onChange={e => updateElement(selected.id, { x: parseInt(e.target.value) })}
                      className="h-8"
                      data-testid="input-x-pos"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Y</label>
                    <Input
                      type="number"
                      value={Math.round(selected.y)}
                      onChange={e => updateElement(selected.id, { y: parseInt(e.target.value) })}
                      className="h-8"
                      data-testid="input-y-pos"
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">W</label>
                    <Input
                      type="number"
                      value={Math.round(selected.width)}
                      onChange={e => updateElement(selected.id, { width: parseInt(e.target.value) })}
                      className="h-8"
                      data-testid="input-width"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">H</label>
                    <Input
                      type="number"
                      value={Math.round(selected.height)}
                      onChange={e => updateElement(selected.id, { height: parseInt(e.target.value) })}
                      className="h-8"
                      data-testid="input-height"
                    />
                  </div>
                </div>
              </div>

              {/* Text Properties */}
              {selected.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Text</Label>
                    <Input
                      value={selected.content}
                      onChange={e => updateElement(selected.id, { content: e.target.value })}
                      className="h-8 text-xs"
                      data-testid="input-text-content"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Font Size</Label>
                    <Slider
                      value={[selected.fontSize || 24]}
                      onValueChange={e => updateElement(selected.id, { fontSize: e[0] })}
                      min={8}
                      max={72}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{selected.fontSize}px</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selected.color || '#000000'}
                        onChange={e => updateElement(selected.id, { color: e.target.value })}
                        className="h-8 w-16 cursor-pointer rounded"
                        data-testid="input-color"
                      />
                      <span className="text-xs text-muted-foreground flex items-center">{selected.color}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Logo Properties */}
              {selected.type === 'logo' && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Image URL</Label>
                  <Input
                    value={selected.content}
                    onChange={e => updateElement(selected.id, { content: e.target.value })}
                    className="h-8 text-xs"
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>
              )}

              {/* Z-Index */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Stacking</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const maxZ = Math.max(...design.elements.map(e => e.zIndex), 0);
                      updateElement(selected.id, { zIndex: maxZ + 1 });
                    }}
                    data-testid="button-bring-front"
                  >
                    Front
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateElement(selected.id, { zIndex: Math.max(...design.elements.map(e => e.zIndex), 0) - 1 })}
                    data-testid="button-send-back"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Background */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs font-semibold">Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={design.bgColor}
                onChange={e => setDesign(d => ({ ...d, bgColor: e.target.value }))}
                className="h-10 w-20 cursor-pointer rounded"
                data-testid="input-bg-color"
              />
              <span className="text-xs text-muted-foreground flex items-center">{design.bgColor}</span>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Button onClick={() => onSave?.(design)} className="w-full" data-testid="button-save-design">
          <Copy className="w-4 h-4 mr-2" />
          Save Design
        </Button>
      </div>
    </div>
  );
}
