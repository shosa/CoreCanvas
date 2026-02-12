'use client';

import { forwardRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { DateTimeElement as DateTimeElementType } from '@/types';
import { format } from 'date-fns';

interface Props {
  element: DateTimeElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const DateTimeElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const width = element.width * scale;
    const height = element.height * scale;
    const fontSize = element.fontSize * scale;

    let previewText = element.dateFormat;
    try {
      previewText = format(new Date(), element.dateFormat);
    } catch {
      previewText = element.dateFormat;
    }

    return (
      <Group
        ref={ref}
        x={element.x * scale}
        y={element.y * scale}
        width={width}
        height={height}
        draggable
        rotation={element.rotation}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      >
        <Rect
          width={width}
          height={height}
          stroke="#10b981"
          strokeWidth={1}
          dash={[3, 3]}
          fill="rgba(16, 185, 129, 0.05)"
        />
        <Text
          text={previewText}
          fontSize={fontSize}
          fill="#10b981"
          x={2}
          y={(height - fontSize) / 2}
        />
      </Group>
    );
  },
);

DateTimeElement.displayName = 'DateTimeElement';
