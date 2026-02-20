'use client';

import { forwardRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { VariableElement as VariableElementType } from '@/types';

interface Props {
  element: VariableElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const VariableElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const width = element.width * scale;
    const fontSize = Math.round(element.fontSize) * scale;
    const height = fontSize * 1.2 + 2;

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
          stroke="#3b82f6"
          strokeWidth={1}
          dash={[3, 3]}
          fill="rgba(59, 130, 246, 0.05)"
        />
        <Text
          text={`{{${element.variableName}}}`}
          fontSize={fontSize}
          fill="#3b82f6"
          fontStyle="italic"
          x={2}
          y={0}
          height={height}
          verticalAlign="middle"
        />
      </Group>
    );
  },
);

VariableElement.displayName = 'VariableElement';
