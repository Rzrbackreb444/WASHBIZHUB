import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { WidgetRenderer, type WidgetConfig } from "./WidgetRenderer";
import { getWidgetById } from "@/lib/widget-catalog";

interface LayoutItem extends WidgetConfig {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface WidgetCanvasProps {
  widgets: LayoutItem[];
  isEditing?: boolean;
  columns?: number;
  rowHeight?: number;
  gap?: number;
  onLayoutChange?: (widgets: LayoutItem[]) => void;
  onWidgetRemove?: (id: string) => void;
  onWidgetSettings?: (id: string) => void;
  className?: string;
}

export function WidgetCanvas({
  widgets,
  isEditing = false,
  columns = 12,
  rowHeight = 80,
  gap = 16,
  onLayoutChange,
  onWidgetRemove,
  onWidgetSettings,
  className,
}: WidgetCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = widgets.findIndex((w) => w.id === active.id);
        const newIndex = widgets.findIndex((w) => w.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newWidgets = arrayMove(widgets, oldIndex, newIndex);
          onLayoutChange?.(recalculatePositions(newWidgets, columns));
        }
      }
    },
    [widgets, columns, onLayoutChange]
  );

  const activeWidget = activeId
    ? widgets.find((w) => w.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "grid auto-rows-min w-full",
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${gap}px`,
        }}
        data-testid="widget-canvas"
      >
        <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          {widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              isEditing={isEditing}
              isDragging={activeId === widget.id}
              rowHeight={rowHeight}
              onRemove={onWidgetRemove}
              onSettings={onWidgetSettings}
            />
          ))}
        </SortableContext>
      </div>

      <DragOverlay adjustScale style={{ transformOrigin: "0 0" }}>
        {activeWidget ? (
          <div
            style={{
              gridColumn: `span ${activeWidget.w}`,
              minHeight: activeWidget.h * rowHeight,
            }}
            className="opacity-80"
          >
            <WidgetRenderer
              widget={activeWidget}
              isEditing={false}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableWidgetProps {
  widget: LayoutItem;
  isEditing: boolean;
  isDragging: boolean;
  rowHeight: number;
  onRemove?: (id: string) => void;
  onSettings?: (id: string) => void;
}

function SortableWidget({
  widget,
  isEditing,
  isDragging,
  rowHeight,
  onRemove,
  onSettings,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: widget.id,
    disabled: !isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.w}`,
    minHeight: widget.h * rowHeight,
  };

  const definition = getWidgetById(widget.widgetType);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-40"
      )}
      {...(isEditing ? { ...attributes, ...listeners } : {})}
      data-testid={`widget-container-${widget.id}`}
    >
      <WidgetRenderer
        widget={widget}
        isEditing={isEditing}
        isDragging={isDragging}
        onRemove={onRemove}
        onSettings={onSettings}
      />
    </div>
  );
}

function recalculatePositions(widgets: LayoutItem[], columns: number): LayoutItem[] {
  let currentX = 0;
  let currentY = 0;
  let rowMaxHeight = 0;

  return widgets.map((widget) => {
    if (currentX + widget.w > columns) {
      currentX = 0;
      currentY += rowMaxHeight;
      rowMaxHeight = 0;
    }

    const positioned = {
      ...widget,
      x: currentX,
      y: currentY,
    };

    currentX += widget.w;
    rowMaxHeight = Math.max(rowMaxHeight, widget.h);

    return positioned;
  });
}

export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createWidget(
  widgetType: string,
  overrides: Partial<LayoutItem> = {}
): LayoutItem {
  const definition = getWidgetById(widgetType as any);
  
  return {
    id: generateWidgetId(),
    widgetType: widgetType as any,
    x: 0,
    y: 0,
    w: definition?.defaultSize.w || 4,
    h: definition?.defaultSize.h || 3,
    showHeader: true,
    showBorder: true,
    ...overrides,
  };
}

export default WidgetCanvas;
