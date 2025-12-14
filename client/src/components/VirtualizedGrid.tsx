import { useRef, useState, useEffect, useCallback, memo } from 'react';
import * as ReactWindow from 'react-window';

const FixedSizeGrid = (ReactWindow as any).FixedSizeGrid || (ReactWindow as any).default?.FixedSizeGrid;

type GridChildComponentProps = { columnIndex: number; rowIndex: number; style: React.CSSProperties };

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
  const [dimensions, setDimensions] = useState({ width: 0, columns: 1 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const columns = Math.max(1, Math.floor((width + gap) / (minItemWidth + gap)));
      setDimensions({ width, columns });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [gap, minItemWidth]);

  const { width, columns } = dimensions;
  const columnWidth = columns > 0 ? (width - gap * (columns - 1)) / columns : width;
  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * (itemHeight + gap) - gap;
  const actualHeight = Math.min(containerHeight, totalHeight + 20);

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const index = rowIndex * columns + columnIndex;
      if (index >= items.length) return null;

      const adjustedStyle = {
        ...style,
        left: Number(style.left) + (columnIndex > 0 ? 0 : 0),
        top: Number(style.top),
        width: columnWidth,
        height: itemHeight,
        paddingRight: columnIndex < columns - 1 ? gap : 0,
        paddingBottom: gap,
      };

      return (
        <div style={adjustedStyle} data-testid={`${testIdPrefix}-${index}`}>
          <div style={{ height: itemHeight }}>
            {renderItem(items[index], index)}
          </div>
        </div>
      );
    },
    [columns, columnWidth, items, itemHeight, gap, renderItem, testIdPrefix]
  );

  if (items.length === 0) {
    return emptyState || null;
  }

  if (items.length < 50 || width === 0) {
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

  return (
    <div ref={containerRef} className={className}>
      {width > 0 && (
        <FixedSizeGrid
          columnCount={columns}
          columnWidth={columnWidth + (columns > 1 ? gap / (columns - 1) * (columns - 1) / columns : 0)}
          height={actualHeight}
          rowCount={rowCount}
          rowHeight={itemHeight + gap}
          width={width}
          overscanRowCount={2}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </div>
  );
}

export const VirtualizedGrid = memo(VirtualizedGridInner) as typeof VirtualizedGridInner;
export default VirtualizedGrid;
