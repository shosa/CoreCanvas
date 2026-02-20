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
    // height sempre derivata dal fontSize: fontSize * line-height + 2px margine
    const fontSize = Math.round(element.fontSize) * scale;
    const h = fontSize * 1.2 + 2;

    const fontStyle = [
      element.bold ? 'bold' : '',
      element.italic ? 'italic' : '',
    ].filter(Boolean).join(' ') || 'normal';

    const textDecoration = element.underline ? 'underline' : '';
    const textColor = element.inverted ? 'white' : 'black';
    const padding = element.inverted ? 2 : 0;

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
          <Rect x={0} y={0} width={w} height={h} fill="black" />
        )}
        <Text
          x={padding}
          y={0}
          width={w - padding * 2}
          height={h}
          text={element.text}
          fontSize={fontSize}
          fontFamily={element.fontFamily || 'Arimo'}
          fontStyle={fontStyle}
          textDecoration={textDecoration}
          align={element.align || 'left'}
          verticalAlign="middle"
          letterSpacing={element.letterSpacing || 0}
          fill={textColor}
          wrap="word"
        />
      </Group>
    );
  },
);

TextElement.displayName = 'TextElement';
