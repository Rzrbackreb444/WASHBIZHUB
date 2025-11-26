import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Settings, Eye, Save, Share2, Download, Code, Search,
  GripVertical, Plus, Trash2, Copy, ChevronRight,
  Calculator, LayoutDashboard, FileText, FormInput, ShoppingCart,
  Globe, Tag, Sparkles, Check, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// BUILDER TYPES
// ============================================================================

export type BuilderType = 'calculator' | 'dashboard' | 'template' | 'form' | 'pos';

export interface BuilderElement {
  id: string;
  type: string;
  config: Record<string, any>;
  order: number;
}

export interface BuilderMetadata {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  primaryColor: string;
}

export interface SEOConfig {
  title: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  schemaType: 'WebApplication' | 'SoftwareApplication' | 'Product';
  structuredData?: Record<string, any>;
}

export interface BuilderState {
  metadata: BuilderMetadata;
  elements: BuilderElement[];
  seo: SEOConfig;
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    price: number;
  };
  status: 'draft' | 'published';
}

// ============================================================================
// BUILDER ICON MAP
// ============================================================================

const BUILDER_ICONS: Record<BuilderType, React.ReactNode> = {
  calculator: <Calculator className="w-5 h-5" />,
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  template: <FileText className="w-5 h-5" />,
  form: <FormInput className="w-5 h-5" />,
  pos: <ShoppingCart className="w-5 h-5" />
};

const BUILDER_LABELS: Record<BuilderType, string> = {
  calculator: 'Calculator',
  dashboard: 'Dashboard',
  template: 'Template',
  form: 'Form',
  pos: 'POS System'
};

// ============================================================================
// SORTABLE ELEMENT WRAPPER
// ============================================================================

interface SortableElementProps {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
  onDuplicate: () => void;
}

function SortableElement({ id, children, onRemove, onDuplicate }: SortableElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-lg border bg-card p-4",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
          data-testid={`drag-handle-${id}`}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <div className="pl-6">
        {children}
      </div>
      
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDuplicate}
          data-testid={`duplicate-${id}`}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-600"
          onClick={onRemove}
          data-testid={`remove-${id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SEO PANEL
// ============================================================================

interface SEOPanelProps {
  seo: SEOConfig;
  onChange: (seo: SEOConfig) => void;
  builderType: BuilderType;
}

function SEOPanel({ seo, onChange, builderType }: SEOPanelProps) {
  const updateField = (field: keyof SEOConfig, value: any) => {
    onChange({ ...seo, [field]: value });
  };

  return (
    <div className="space-y-6" data-testid="seo-panel">
      <div className="flex items-center gap-2 pb-3 border-b">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">SEO & AEO Optimization</h3>
        <Badge variant="secondary" className="ml-auto">
          <Sparkles className="w-3 h-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="seo-title">SEO Title</Label>
          <Input
            id="seo-title"
            value={seo.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={`${BUILDER_LABELS[builderType]} - WashBizHub`}
            maxLength={60}
            data-testid="input-seo-title"
          />
          <p className="text-xs text-muted-foreground">
            {seo.title.length}/60 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">Meta Description</Label>
          <Textarea
            id="seo-description"
            value={seo.metaDescription}
            onChange={(e) => updateField('metaDescription', e.target.value)}
            placeholder="A compelling description for search engines..."
            maxLength={160}
            rows={3}
            data-testid="input-seo-description"
          />
          <p className="text-xs text-muted-foreground">
            {seo.metaDescription.length}/160 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
          <Input
            id="seo-keywords"
            value={seo.keywords.join(', ')}
            onChange={(e) => updateField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
            placeholder="laundromat valuation, ROI calculator, business analysis"
            data-testid="input-seo-keywords"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schema-type">Schema Type (Structured Data)</Label>
          <Select 
            value={seo.schemaType} 
            onValueChange={(v) => updateField('schemaType', v)}
          >
            <SelectTrigger data-testid="select-schema-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WebApplication">WebApplication</SelectItem>
              <SelectItem value="SoftwareApplication">SoftwareApplication</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <p className="text-sm font-medium">Search Preview</p>
                <p className="text-xs text-blue-600 mt-1">
                  washbizhub.com/{builderType}s/{seo.title.toLowerCase().replace(/\s+/g, '-')}
                </p>
                <p className="text-sm font-medium text-blue-800 mt-1">
                  {seo.title || `Untitled ${BUILDER_LABELS[builderType]}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {seo.metaDescription || 'Add a meta description...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN BUILDER CONTAINER
// ============================================================================

interface BuilderContainerProps {
  type: BuilderType;
  initialState?: Partial<BuilderState>;
  elementPalette: React.ReactNode;
  elementRenderer: (element: BuilderElement, onChange: (config: Record<string, any>) => void) => React.ReactNode;
  previewRenderer: (elements: BuilderElement[]) => React.ReactNode;
  onSave: (state: BuilderState) => Promise<void>;
  onPublish?: (state: BuilderState) => Promise<void>;
  categories: string[];
}

export function BuilderContainer({
  type,
  initialState,
  elementPalette,
  elementRenderer,
  previewRenderer,
  onSave,
  onPublish,
  categories
}: BuilderContainerProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'settings' | 'seo' | 'preview'>('design');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [state, setState] = useState<BuilderState>(() => ({
    metadata: {
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      category: categories[0] || 'general',
      tags: [],
      primaryColor: '#00A699'
    },
    elements: [],
    seo: {
      title: '',
      metaDescription: '',
      keywords: [],
      schemaType: 'WebApplication'
    },
    pricing: {
      type: 'free',
      price: 0
    },
    status: 'draft',
    ...initialState
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setState(prev => {
        const oldIndex = prev.elements.findIndex(e => e.id === active.id);
        const newIndex = prev.elements.findIndex(e => e.id === over.id);
        
        return {
          ...prev,
          elements: arrayMove(prev.elements, oldIndex, newIndex).map((e, i) => ({
            ...e,
            order: i
          }))
        };
      });
      setHasUnsavedChanges(true);
    }
  };

  const addElement = (elementType: string, config: Record<string, any> = {}) => {
    const newElement: BuilderElement = {
      id: `${elementType}-${Date.now()}`,
      type: elementType,
      config,
      order: state.elements.length
    };
    
    setState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    setHasUnsavedChanges(true);
  };

  const updateElement = (id: string, config: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.map(e => 
        e.id === id ? { ...e, config } : e
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeElement = (id: string) => {
    setState(prev => ({
      ...prev,
      elements: prev.elements.filter(e => e.id !== id)
    }));
    setHasUnsavedChanges(true);
  };

  const duplicateElement = (id: string) => {
    const element = state.elements.find(e => e.id === id);
    if (element) {
      addElement(element.type, { ...element.config });
    }
  };

  const updateMetadata = (updates: Partial<BuilderMetadata>) => {
    setState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates }
    }));
    setHasUnsavedChanges(true);
  };

  const updateSEO = (seo: SEOConfig) => {
    setState(prev => ({ ...prev, seo }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(state);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (onPublish) {
      setIsSaving(true);
      try {
        await onPublish({ ...state, status: 'published' });
        setState(prev => ({ ...prev, status: 'published' }));
        setHasUnsavedChanges(false);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid={`builder-${type}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {BUILDER_ICONS[type]}
          </div>
          <div>
            <h1 className="text-lg font-semibold">
              {state.metadata.name || `New ${BUILDER_LABELS[type]}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {BUILDER_LABELS[type]} Builder
            </p>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="outline" className="ml-2">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unsaved
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={isSaving}
            data-testid="button-save"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          {onPublish && (
            <Button 
              onClick={handlePublish}
              disabled={isSaving || !state.metadata.name}
              data-testid="button-publish"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Element Palette */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Elements
          </h2>
          {elementPalette}
        </div>

        {/* Center - Main Editor */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-12">
              <TabsTrigger value="design" className="gap-2" data-testid="tab-design">
                <Settings className="w-4 h-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
                <Tag className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2" data-testid="tab-seo">
                <Search className="w-4 h-4" />
                SEO/AEO
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2" data-testid="tab-preview">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="flex-1 m-0 overflow-y-auto p-4">
              {state.elements.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No elements yet</p>
                    <p className="text-sm">Add elements from the left panel</p>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={state.elements.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {state.elements.map(element => (
                        <SortableElement
                          key={element.id}
                          id={element.id}
                          onRemove={() => removeElement(element.id)}
                          onDuplicate={() => duplicateElement(element.id)}
                        >
                          {elementRenderer(element, (config) => updateElement(element.id, config))}
                        </SortableElement>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 overflow-y-auto p-4">
              <div className="max-w-2xl space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={state.metadata.name}
                      onChange={(e) => {
                        updateMetadata({ 
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        });
                      }}
                      placeholder={`My ${BUILDER_LABELS[type]}`}
                      data-testid="input-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        /{type}s/
                      </span>
                      <Input
                        id="slug"
                        value={state.metadata.slug}
                        onChange={(e) => updateMetadata({ slug: e.target.value })}
                        placeholder="my-calculator"
                        data-testid="input-slug"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={state.metadata.description}
                      onChange={(e) => updateMetadata({ description: e.target.value })}
                      placeholder="A detailed description..."
                      rows={4}
                      data-testid="input-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={state.metadata.category}
                      onValueChange={(v) => updateMetadata({ category: v })}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Monetization</h3>
                  
                  <div className="space-y-2">
                    <Label>Pricing Type</Label>
                    <Select 
                      value={state.pricing.type}
                      onValueChange={(v: 'free' | 'paid' | 'subscription') => 
                        setState(prev => ({ ...prev, pricing: { ...prev.pricing, type: v } }))
                      }
                    >
                      <SelectTrigger data-testid="select-pricing-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">One-time Purchase</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {state.pricing.type !== 'free' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step={0.01}
                        value={state.pricing.price}
                        onChange={(e) => 
                          setState(prev => ({ 
                            ...prev, 
                            pricing: { ...prev.pricing, price: parseFloat(e.target.value) || 0 } 
                          }))
                        }
                        data-testid="input-price"
                      />
                      <p className="text-xs text-muted-foreground">
                        You'll earn 80% (${((state.pricing.price || 0) * 0.8).toFixed(2)}) per sale
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="flex-1 m-0 overflow-y-auto p-4">
              <div className="max-w-2xl">
                <SEOPanel 
                  seo={state.seo} 
                  onChange={updateSEO}
                  builderType={type}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 overflow-y-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    This is how your {BUILDER_LABELS[type].toLowerCase()} will appear to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewRenderer(state.elements)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

