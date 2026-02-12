'use client';

import { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasElement } from '@/types';
import { TextElement } from './elements/TextElement';
import { BarcodeElement } from './elements/BarcodeElement';
import { QRCodeElement } from './elements/QRCodeElement';
import { ShapeElement } from './elements/ShapeElement';
import { ImageElement } from './elements/ImageElement';
import { VariableElement } from './elements/VariableElement';
import { CounterElement } from './elements/CounterElement';
import { DateTimeElement } from './elements/DateTimeElement';

interface Props {
  elements: CanvasElement[];
  selectedId: string | null;
  zoom: number;
  pixelsPerMm: number;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export function ElementsLayer({ elements, selectedId, zoom, pixelsPerMm, onSelect, onUpdate }: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedRef = useRef<Konva.Node>(null);

  useEffect(() => {
    if (trRef.current && selectedRef.current && selectedId) {
      trRef.current.nodes([selectedRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, elements]);

  const scale = zoom * pixelsPerMm;

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const handleDragEnd = (id: string, e: any) => {
    onUpdate(id, {
      x: e.target.x() / scale,
      y: e.target.y() / scale,
    });
  };

  const handleTransformEnd = (id: string, e: any) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const el = elements.find(el => el.id === id);
    const newWidth = (node.width() * scaleX) / scale;
    const newHeight = (node.height() * scaleY) / scale;

    // For text-based elements, scale fontSize proportionally
    const isTextType = el && (el.type === 'text' || el.type === 'variable' || el.type === 'counter' || el.type === 'datetime');
    if (isTextType && 'fontSize' in el) {
      const avgScale = (scaleX + scaleY) / 2;
      onUpdate(id, {
        x: node.x() / scale,
        y: node.y() / scale,
        width: newWidth,
        height: newHeight,
        fontSize: Math.max(1, el.fontSize * avgScale),
        rotation: node.rotation(),
      } as any);
    } else {
      onUpdate(id, {
        x: node.x() / scale,
        y: node.y() / scale,
        width: newWidth,
        height: newHeight,
        rotation: node.rotation(),
      });
    }
  };

  const renderElement = (element: CanvasElement) => {
    const isSelected = element.id === selectedId;
    const commonProps = {
      key: element.id,
      element,
      scale,
      isSelected,
      onSelect: () => onSelect(element.id),
      onDragEnd: (e: any) => handleDragEnd(element.id, e),
      onTransformEnd: (e: any) => handleTransformEnd(element.id, e),
      ref: isSelected ? selectedRef : undefined,
    };

    switch (element.type) {
      case 'text':
        return <TextElement {...commonProps} />;
      case 'barcode':
        return <BarcodeElement {...commonProps} />;
      case 'qrcode':
        return <QRCodeElement {...commonProps} />;
      case 'shape':
        return <ShapeElement {...commonProps} />;
      case 'image':
        return <ImageElement {...commonProps} />;
      case 'variable':
        return <VariableElement {...commonProps} />;
      case 'counter':
        return <CounterElement {...commonProps} />;
      case 'datetime':
        return <DateTimeElement {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      {sorted.map(renderElement)}
      <Transformer
        ref={trRef}
        rotateEnabled={true}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < 10 || newBox.height < 10) return oldBox;
          return newBox;
        }}
      />
    </>
  );
}
