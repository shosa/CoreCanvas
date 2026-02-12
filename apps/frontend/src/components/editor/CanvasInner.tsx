'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '@/store/editorStore';
import { ElementsLayer } from './ElementsLayer';
import { ContextMenu } from './ContextMenu';

const PIXELS_PER_MM = 3.78; // 96 DPI screen / 25.4 mm

interface ContextMenuState {
  x: number;
  y: number;
  elementId: string | null;
}

export function CanvasInner() {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    labelConfig,
    zoom,
    setZoom,
    showGrid,
    selectedId,
    setSelectedId,
    elements,
    updateElement,
  } = useEditorStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const stageWidth = labelConfig.width * PIXELS_PER_MM * zoom;
  const stageHeight = labelConfig.height * PIXELS_PER_MM * zoom;

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const delta = e.evt.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    },
    [zoom, setZoom],
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Close context menu on any click
      setContextMenu(null);
      if (e.target === e.target.getStage() || e.target.name() === 'background') {
        setSelectedId(null);
      }
    },
    [setSelectedId],
  );

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      e.evt.stopPropagation();

      const stage = stageRef.current;
      if (!stage) return;

      const menuX = e.evt.clientX;
      const menuY = e.evt.clientY;

      // Find which element was right-clicked
      const target = e.target;
      let clickedElementId: string | null = null;

      if (target !== stage && target.name() !== 'background') {
        // Walk up to find the element group/shape with an id
        let node: Konva.Node | null = target;
        while (node && node !== stage) {
          const nodeId = node.id();
          if (nodeId && elements.some(el => el.id === nodeId)) {
            clickedElementId = nodeId;
            break;
          }
          node = node.parent;
        }
        // If not found by id, select the clicked element by checking parent groups
        if (!clickedElementId && selectedId) {
          clickedElementId = selectedId;
        }
      }

      if (clickedElementId) {
        setSelectedId(clickedElementId);
      }

      setContextMenu({ x: menuX, y: menuY, elementId: clickedElementId });
    },
    [elements, selectedId, setSelectedId],
  );

  // Disable browser context menu on the canvas container
  useEffect(() => {
    const container = stageRef.current?.container();
    if (!container) return;
    const prevent = (e: Event) => e.preventDefault();
    container.addEventListener('contextmenu', prevent);
    return () => container.removeEventListener('contextmenu', prevent);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          useEditorStore.getState().deleteElement(selectedId);
        }
      }
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        useEditorStore.getState().undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        useEditorStore.getState().redo();
      }
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (selectedId) useEditorStore.getState().duplicateElement(selectedId);
      }
      // Escape closes context menu
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId]);

  const gridLines = [];
  if (showGrid) {
    const gridSpacing = 5 * PIXELS_PER_MM * zoom; // 5mm grid
    for (let x = 0; x <= stageWidth; x += gridSpacing) {
      gridLines.push(
        <Line key={`v-${x}`} points={[x, 0, x, stageHeight]} stroke="#e2e8f0" strokeWidth={0.5} />,
      );
    }
    for (let y = 0; y <= stageHeight; y += gridSpacing) {
      gridLines.push(
        <Line key={`h-${y}`} points={[0, y, stageWidth, y]} stroke="#e2e8f0" strokeWidth={0.5} />,
      );
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-200 flex items-center justify-center p-8">
      <div
        style={{
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onContextMenu={handleContextMenu}
        >
          {/* Background layer */}
          <Layer>
            <Rect
              name="background"
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
              fill="white"
            />
            {gridLines}
          </Layer>

          {/* Elements layer */}
          <Layer>
            <ElementsLayer
              elements={elements}
              selectedId={selectedId}
              zoom={zoom}
              pixelsPerMm={PIXELS_PER_MM}
              onSelect={setSelectedId}
              onUpdate={updateElement}
            />
          </Layer>
        </Stage>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            elementId={contextMenu.elementId}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>
    </div>
  );
}
