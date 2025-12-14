import { useRef, useState, useEffect, memo } from 'react';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  gap?: number;
  minItemWidth?: number;
  className?: string;
  containerHeight?: number;
  emptyState?: React.ReactNode;
  testIdPrefix?: string;
}

function VirtualizedGridInner<T>({
  items,
  renderItem,
  itemHeight,
  gap = 16,
  minItemWidth = 300,
  className = '',
  containerHeight = 600,
  emptyState,
  testIdPrefix = 'grid-item',
}: VirtualizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length <= 50) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const rowHeight = itemHeight + gap;
      
      const startRow = Math.floor(scrollTop / rowHeight);
      const visibleRows = Math.ceil(viewportHeight / rowHeight);
      const buffer = 5;
      
      const columnsPerRow = Math.max(1, Math.floor(container.clientWidth / (minItemWidth + gap)));
      const startIndex = Math.max(0, (startRow - buffer) * columnsPerRow);
      const endIndex = Math.min(items.length, (startRow + visibleRows + buffer) * columnsPerRow);
      
      setVisibleRange({ start: startIndex, end: endIndex });
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items.length, itemHeight, gap, minItemWidth]);

  if (items.length === 0) {
    return emptyState || null;
  }

  // For smaller lists, render all items
  if (items.length <= 50) {
    return (
      <div ref={containerRef} className={className}>
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))` 
          }}
        >
          {items.map((item, index) => (
            <div key={index} data-testid={`${testIdPrefix}-${index}`}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For larger lists, use windowing with CSS grid
  const { start, end } = visibleRange;
  const columnsPerRow = Math.max(1, Math.floor(800 / (minItemWidth + gap))); // Estimate
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const totalHeight = totalRows * (itemHeight + gap);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        height: containerHeight, 
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}px, 1fr))`,
            position: 'absolute',
            top: Math.floor(start / columnsPerRow) * (itemHeight + gap),
            left: 0,
            right: 0
          }}
        >
          {items.slice(start, end).map((item, idx) => (
            <div 
              key={start + idx} 
              data-testid={`${testIdPrefix}-${start + idx}`}
              style={{ height: itemHeight }}
            >
              {renderItem(item, start + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const VirtualizedGrid = memo(VirtualizedGridInner) as typeof VirtualizedGridInner;
export default VirtualizedGrid;
