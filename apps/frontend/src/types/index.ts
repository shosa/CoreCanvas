// Element types
export type ElementType = 'text' | 'barcode' | 'qrcode' | 'shape' | 'image' | 'variable' | 'counter' | 'datetime';

export type ShapeType = 'rectangle' | 'line' | 'ellipse';

export type BarcodeType = 'code128' | 'code39' | 'ean13' | 'ean8' | 'upca' | 'code93' | 'itf';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type TextAlign = 'left' | 'center' | 'right';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;       // mm
  y: number;       // mm
  width: number;   // mm
  height: number;  // mm
  rotation: number;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;    // mm
  fontFamily: string;  // e.g. 'Arial', 'Helvetica', 'Times New Roman'
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlign;
  letterSpacing: number; // px
  inverted: boolean;   // white text on black background (ZPL ^FR)
}

export interface BarcodeElement extends BaseElement {
  type: 'barcode';
  data: string;
  barcodeType: BarcodeType;
  barcodeHeight: number;  // mm
  moduleWidth: number;
  showText: boolean;
}

export interface QRCodeElement extends BaseElement {
  type: 'qrcode';
  data: string;
  magnification: number;
  errorCorrection: ErrorCorrectionLevel;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  borderWidth: number;  // mm
  filled: boolean;
  cornerRadius?: number;  // mm
  orientation?: 'horizontal' | 'vertical';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  minioPath: string;
  imageUrl?: string;
  imageId: string;
  originalName: string;
}

export interface VariableElement extends BaseElement {
  type: 'variable';
  variableName: string;
  defaultValue: string;
  fontSize: number;
}

export interface CounterElement extends BaseElement {
  type: 'counter';
  counterName: string;
  startValue: number;
  prefix: string;
  padding: number;
  fontSize: number;
}

export interface DateTimeElement extends BaseElement {
  type: 'datetime';
  dateFormat: string;
  fontSize: number;
}

export type CanvasElement =
  | TextElement
  | BarcodeElement
  | QRCodeElement
  | ShapeElement
  | ImageElement
  | VariableElement
  | CounterElement
  | DateTimeElement;

// Label config
export interface LabelConfig {
  width: number;   // mm
  height: number;  // mm
  dpi: number;
}

// Template
export interface Template {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  minioPath: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { printLogs: number };
  design?: {
    elements: CanvasElement[];
    labelConfig: LabelConfig;
  };
}

// Image
export interface UploadedImage {
  id: string;
  name: string;
  minioPath: string;
  width: number;
  height: number;
  createdAt: string;
  url?: string;
}

// Counter
export interface Counter {
  id: string;
  name: string;
  value: number;
  prefix: string;
  padding: number;
}

// Printer status
export interface PrinterStatus {
  online: boolean;
  host: string;
  port: number;
  name: string;
  message: string;
}

// Printer config
export interface PrinterConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  dpi: number;
}

// Print result
export interface PrintResult {
  success: boolean;
  message: string;
}
