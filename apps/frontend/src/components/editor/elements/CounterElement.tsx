'use client';

import { forwardRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { CounterElement as CounterElementType } from '@/types';

interface Props {
  element: CounterElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const CounterElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const width = element.width * scale;
    const height = element.height * scale;
    const fontSize = element.fontSize * scale;

    const previewValue = element.prefix + String(element.startValue).padStart(element.padding, '0');

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
          stroke="#f59e0b"
          strokeWidth={1}
          dash={[3, 3]}
          fill="rgba(245, 158, 11, 0.05)"
        />
        <Text
          text={previewValue}
          fontSize={fontSize}
          fill="#f59e0b"
          x={2}
          y={(height - fontSize) / 2}
        />
      </Group>
    );
  },
);

CounterElement.displayName = 'CounterElement';
