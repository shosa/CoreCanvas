'use client';

import { forwardRef } from 'react';
import { Rect, Ellipse, Line, Group } from 'react-konva';
import { ShapeElement as ShapeElementType } from '@/types';

interface Props {
  element: ShapeElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const ShapeElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = element.width * scale;
    const height = element.height * scale;
    const borderWidth = element.borderWidth * scale;

    switch (element.shapeType) {
      case 'ellipse':
        return (
          <Ellipse
            ref={ref}
            x={x + width / 2}
            y={y + height / 2}
            radiusX={width / 2}
            radiusY={height / 2}
            stroke="black"
            strokeWidth={borderWidth}
            fill={element.filled ? 'black' : undefined}
            draggable
            rotation={element.rotation}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
          />
        );

      case 'line':
        return (
          <Line
            ref={ref}
            x={x}
            y={y}
            points={element.orientation === 'vertical' ? [0, 0, 0, height] : [0, 0, width, 0]}
            stroke="black"
            strokeWidth={borderWidth}
            draggable
            rotation={element.rotation}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
          />
        );

      default: // rectangle
        return (
          <Rect
            ref={ref}
            x={x}
            y={y}
            width={width}
            height={height}
            stroke="black"
            strokeWidth={borderWidth}
            fill={element.filled ? 'black' : undefined}
            cornerRadius={element.cornerRadius ? element.cornerRadius * scale : 0}
            draggable
            rotation={element.rotation}
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={onDragEnd}
            onTransformEnd={onTransformEnd}
          />
        );
    }
  },
);

ShapeElement.displayName = 'ShapeElement';
