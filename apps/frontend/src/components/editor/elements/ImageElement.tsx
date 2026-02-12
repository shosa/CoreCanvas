'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { ImageElement as ImageElementType } from '@/types';

interface Props {
  element: ImageElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const ImageElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      if (element.imageUrl) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = element.imageUrl;
        img.onload = () => setImage(img);
        img.onerror = () => setImage(null);
      }
    }, [element.imageUrl]);

    const width = element.width * scale;
    const height = element.height * scale;

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
        {image ? (
          <KonvaImage image={image} width={width} height={height} />
        ) : (
          <>
            <Rect width={width} height={height} stroke="#ccc" strokeWidth={1} dash={[4, 4]} />
            <Text text={element.originalName || 'Immagine'} fontSize={10} fill="#999" x={4} y={height / 2 - 5} />
          </>
        )}
      </Group>
    );
  },
);

ImageElement.displayName = 'ImageElement';
