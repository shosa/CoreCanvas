'use client';

import { forwardRef, useEffect, useState } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { QRCodeElement as QRCodeElementType } from '@/types';

interface Props {
  element: QRCodeElementType;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const QRCodeElement = forwardRef<any, Props>(
  ({ element, scale, isSelected, onSelect, onDragEnd, onTransformEnd }, ref) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
      const generateQR = async () => {
        try {
          const QRCode = (await import('qrcode')).default;
          const dataUrl = await QRCode.toDataURL(element.data || 'https://example.com', {
            width: 200,
            margin: 1,
            errorCorrectionLevel: element.errorCorrection || 'M',
          });
          const img = new window.Image();
          img.src = dataUrl;
          img.onload = () => setImage(img);
        } catch (err) {
          setImage(null);
        }
      };
      generateQR();
    }, [element.data, element.errorCorrection]);

    const size = Math.min(element.width, element.height) * scale;

    return (
      <Group
        ref={ref}
        x={element.x * scale}
        y={element.y * scale}
        width={size}
        height={size}
        draggable
        rotation={element.rotation}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={onDragEnd}
        onTransformEnd={onTransformEnd}
      >
        {image ? (
          <KonvaImage image={image} width={size} height={size} />
        ) : (
          <>
            <Rect width={size} height={size} stroke="#ccc" strokeWidth={1} dash={[4, 4]} />
            <Text text="QR" fontSize={14} fill="#999" x={size / 2 - 8} y={size / 2 - 7} />
          </>
        )}
      </Group>
    );
  },
);

QRCodeElement.displayName = 'QRCodeElement';
