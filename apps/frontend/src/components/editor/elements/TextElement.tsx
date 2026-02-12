'use client';

import { forwardRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { TextElement as TextElementType } from '@/types';

interface Props {
  element: TextElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const TextElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const x = element.x * scale;
    const y = element.y * scale;
    const w = element.width * scale;
    const h = element.height * scale;
    const fontSize = element.fontSize * scale;

    return (
      <Group
        ref={ref}
        x={x}
        y={y}
        width={w}
        height={h}
        draggable
        rotation={element.rotation}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      >
        {element.inverted && (
          <Rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill="black"
          />
        )}
        <Text
          x={element.inverted ? 2 : 0}
          y={element.inverted ? 1 : 0}
          width={element.inverted ? w - 4 : w}
          text={element.text}
          fontSize={fontSize}
          fontStyle={element.bold ? 'bold' : 'normal'}
          fill={element.inverted ? 'white' : 'black'}
          verticalAlign="middle"
          height={h}
        />
      </Group>
    );
  },
);

TextElement.displayName = 'TextElement';
