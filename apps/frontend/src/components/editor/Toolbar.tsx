'use client';

import { useState } from 'react';
import { Box, IconButton, Tooltip, Divider, Typography } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BarcodeIcon from '@mui/icons-material/ViewWeek';
import RectangleIcon from '@mui/icons-material/CropSquare';
import RemoveIcon from '@mui/icons-material/Remove';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import TagIcon from '@mui/icons-material/Tag';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import GridOnIcon from '@mui/icons-material/GridOn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { useEditorStore } from '@/store/editorStore';
import { CanvasElement, TextElement, BarcodeElement, QRCodeElement, ShapeElement, ImageElement, VariableElement, CounterElement, DateTimeElement, UploadedImage } from '@/types';
import { ImagePickerDialog } from './ImagePickerDialog';

function generateId(): string {
  // crypto.randomUUID() is only available in secure contexts (HTTPS/localhost)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function Toolbar() {
  const {
    zoom,
    setZoom,
    showGrid,
    toggleGrid,
    selectedId,
    addElement,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    historyIndex,
    history,
  } = useEditorStore();

  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const addText = () => {
    const el: TextElement = {
      id: generateId(),
      type: 'text',
      x: 10,
      y: 10,
      width: 30,
      height: 8,
      rotation: 0,
      zIndex: Date.now(),
      text: 'Testo',
      fontSize: 4,
      bold: false,
      inverted: false,
    };
    addElement(el);
  };

  const addBarcode = () => {
    const el: BarcodeElement = {
      id: generateId(),
      type: 'barcode',
      x: 10,
      y: 10,
      width: 40,
      height: 15,
      rotation: 0,
      zIndex: Date.now(),
      data: '123456789',
      barcodeType: 'code128',
      barcodeHeight: 12,
      moduleWidth: 2,
      showText: true,
    };
    addElement(el);
  };

  const addQRCode = () => {
    const el: QRCodeElement = {
      id: generateId(),
      type: 'qrcode',
      x: 10,
      y: 10,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: Date.now(),
      data: 'https://example.com',
      magnification: 4,
      errorCorrection: 'M',
    };
    addElement(el);
  };

  const addRectangle = () => {
    const el: ShapeElement = {
      id: generateId(),
      type: 'shape',
      x: 10,
      y: 10,
      width: 30,
      height: 20,
      rotation: 0,
      zIndex: Date.now(),
      shapeType: 'rectangle',
      borderWidth: 0.5,
      filled: false,
    };
    addElement(el);
  };

  const addLine = () => {
    const el: ShapeElement = {
      id: generateId(),
      type: 'shape',
      x: 10,
      y: 10,
      width: 40,
      height: 1,
      rotation: 0,
      zIndex: Date.now(),
      shapeType: 'line',
      borderWidth: 0.5,
      filled: false,
      orientation: 'horizontal',
    };
    addElement(el);
  };

  const handleImageSelected = (img: UploadedImage) => {
    // Scale image to fit reasonably on label (max 30mm wide)
    const maxW = 30;
    const ratio = img.height / img.width;
    const w = Math.min(maxW, img.width / 8); // rough mm from pixels
    const h = w * ratio;

    const el: ImageElement = {
      id: generateId(),
      type: 'image',
      x: 10,
      y: 10,
      width: Math.max(5, w),
      height: Math.max(5, h),
      rotation: 0,
      zIndex: Date.now(),
      minioPath: img.minioPath,
      imageUrl: img.url,
      imageId: img.id,
      originalName: img.name,
    };
    addElement(el);
  };

  const addVariable = () => {
    const el: VariableElement = {
      id: generateId(),
      type: 'variable',
      x: 10,
      y: 10,
      width: 30,
      height: 8,
      rotation: 0,
      zIndex: Date.now(),
      variableName: 'nome',
      defaultValue: '{{nome}}',
      fontSize: 4,
    };
    addElement(el);
  };

  const addCounter = () => {
    const el: CounterElement = {
      id: generateId(),
      type: 'counter',
      x: 10,
      y: 10,
      width: 25,
      height: 8,
      rotation: 0,
      zIndex: Date.now(),
      counterName: 'default',
      startValue: 1,
      prefix: '',
      padding: 6,
      fontSize: 4,
    };
    addElement(el);
  };

  const addDateTime = () => {
    const el: DateTimeElement = {
      id: generateId(),
      type: 'datetime',
      x: 10,
      y: 10,
      width: 35,
      height: 8,
      rotation: 0,
      zIndex: Date.now(),
      dateFormat: 'dd/MM/yyyy HH:mm',
      fontSize: 3,
    };
    addElement(el);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {/* Add elements */}
        <Tooltip title="Testo">
          <IconButton size="small" onClick={addText}><TextFieldsIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Barcode">
          <IconButton size="small" onClick={addBarcode}><BarcodeIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="QR Code">
          <IconButton size="small" onClick={addQRCode}><QrCode2Icon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Rettangolo">
          <IconButton size="small" onClick={addRectangle}><RectangleIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Linea">
          <IconButton size="small" onClick={addLine}><RemoveIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Immagine">
          <IconButton size="small" onClick={() => setImagePickerOpen(true)}><ImageIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Variabile">
          <IconButton size="small" onClick={addVariable}><CodeIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Contatore">
          <IconButton size="small" onClick={addCounter}><TagIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Data/Ora">
          <IconButton size="small" onClick={addDateTime}><AccessTimeIcon fontSize="small" /></IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Edit actions */}
        <Tooltip title="Annulla (Ctrl+Z)">
          <span>
            <IconButton size="small" onClick={undo} disabled={historyIndex <= 0}>
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Ripeti (Ctrl+Y)">
          <span>
            <IconButton size="small" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Duplica (Ctrl+D)">
          <span>
            <IconButton size="small" onClick={() => selectedId && duplicateElement(selectedId)} disabled={!selectedId}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Elimina (Del)">
          <span>
            <IconButton size="small" onClick={() => selectedId && deleteElement(selectedId)} disabled={!selectedId}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* View */}
        <Tooltip title="Griglia">
          <IconButton size="small" onClick={toggleGrid} color={showGrid ? 'primary' : 'default'}>
            <GridOnIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={() => setZoom(zoom - 0.25)}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </Typography>
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={() => setZoom(zoom + 0.25)}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <ImagePickerDialog
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelected}
      />
    </>
  );
}
