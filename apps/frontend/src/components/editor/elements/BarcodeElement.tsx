'use client';

import { forwardRef, useEffect, useState, useRef } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { BarcodeElement as BarcodeElementType } from '@/types';

interface Props {
  element: BarcodeElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const BarcodeElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      // Generate barcode preview using bwip-js
      const generateBarcode = async () => {
        try {
          const bwipjs = (await import('bwip-js')).default;
          const canvas = document.createElement('canvas');

          const bwipType: Record<string, string> = {
            code128: 'code128',
            code39: 'code39',
            ean13: 'ean13',
            ean8: 'ean8',
            upca: 'upca',
            code93: 'code93',
            itf: 'interleaved2of5',
          };

          bwipjs.toCanvas(canvas, {
            bcid: bwipType[element.barcodeType] || 'code128',
            text: element.data || '123456789',
            scale: 2,
            height: 10,
            includetext: element.showText,
            textxalign: 'center',
          });

          const img = new window.Image();
          img.src = canvas.toDataURL();
          img.onload = () => setImage(img);
        } catch (err) {
          setImage(null);
        }
      };
      generateBarcode();
    }, [element.data, element.barcodeType, element.showText]);

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
            <Text text="Barcode" fontSize={12} fill="#999" x={4} y={height / 2 - 6} />
          </>
        )}
      </Group>
    );
  },
);

BarcodeElement.displayName = 'BarcodeElement';
