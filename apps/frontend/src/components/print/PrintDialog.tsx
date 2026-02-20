'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';
import axiosInstance from '@/lib/axios';
import { useEditorStore } from '@/store/editorStore';
import {
  CanvasElement,
  TextElement,
  BarcodeElement,
  QRCodeElement,
  ShapeElement,
  ImageElement,
  VariableElement,
  CounterElement,
  DateTimeElement,
} from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  templateId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(d: Date, fmt: string): string {
  return fmt
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('DD', String(d.getDate()).padStart(2, '0'))
    .replace('HH', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'))
    .replace('ss', String(d.getSeconds()).padStart(2, '0'));
}

async function qrToDataUri(data: string, sizePx: number): Promise<string> {
  return QRCode.toDataURL(data || ' ', {
    width: sizePx,
    margin: 0,
    errorCorrectionLevel: 'M',
  });
}

async function barcodeToDataUri(
  data: string,
  bcType: string,
  widthPx: number,
  heightPx: number,
  showText: boolean,
): Promise<string> {
  const canvas = document.createElement('canvas');
  bwipjs.toCanvas(canvas, {
    bcid: bcType || 'code128',
    text: data || '0',
    width: Math.round(widthPx / 10),
    height: Math.round(heightPx / 10),
    includetext: showText,
    textxalign: 'center',
  });
  return canvas.toDataURL('image/png');
}

// ─── HTML generator ───────────────────────────────────────────────────────────

/**
 * Converte i CanvasElement in HTML/CSS pronto per ZplBox.
 * Le coordinate sono già in mm — le usiamo direttamente come CSS.
 * QR e barcode vengono pre-generati come data URI PNG (niente richieste esterne da ZplBox).
 */
// I font nel canvas sono già nomi Google Fonts (Arimo, Tinos, ecc.)
// Costruiamo la URL GF dai font usati nell'etichetta
const GF_FAMILY_PARAMS: Record<string, string> = {
  'Arimo': 'Arimo:ital,wght@0,400;0,700;1,400;1,700',
  'Tinos': 'Tinos:ital,wght@0,400;0,700;1,400;1,700',
  'Courier Prime': 'Courier+Prime:ital,wght@0,400;0,700;1,400',
  'Anton': 'Anton',
  'Comic Neue': 'Comic+Neue:ital,wght@0,400;0,700;1,400',
  'EB Garamond': 'EB+Garamond:ital,wght@0,400;0,700;1,400',
};

function buildGoogleFontsUrl(fontNames: string[]): string | null {
  const families = new Set<string>();
  for (const name of fontNames) {
    const param = GF_FAMILY_PARAMS[name];
    if (param) families.add(param);
  }
  if (families.size === 0) return null;
  return `https://fonts.googleapis.com/css2?${[...families].map(f => `family=${f}`).join('&')}&display=swap`;
}

function getCssFontFamily(name: string): string {
  return name; // già nome GF corretto
}

async function elementsToHtml(
  elements: CanvasElement[],
  widthMm: number,
  heightMm: number,
  variables: Record<string, string>,
): Promise<string> {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const parts: string[] = [];
  const MM_PX = 8; // 203 DPI ≈ 8 px/mm

  // Raccogliamo i font usati
  const usedFonts = new Set<string>();
  for (const el of sorted) {
    if (el.type === 'text') usedFonts.add((el as TextElement).fontFamily || 'Arial');
  }

  for (const el of sorted) {
    const elRot = el.rotation || 0;
    const base = `position:absolute;left:${el.x}mm;top:${el.y}mm;width:${el.width}mm;height:${el.height}mm;`;
    const rot = elRot ? `transform:rotate(${elRot}deg);transform-origin:top left;` : '';

    switch (el.type) {
      case 'text': {
        const t = el as TextElement;
        const bg = t.inverted ? 'background:#000;color:#fff;' : '';
        const fw = t.bold ? 'font-weight:bold;' : '';
        const fi = t.italic ? 'font-style:italic;' : '';
        const fu = t.underline ? 'text-decoration:underline;' : '';
        const fa = t.align ? `text-align:${t.align};` : '';
        const cssFontName = getCssFontFamily(t.fontFamily || 'Arial');
        const ff = `font-family:'${cssFontName}',sans-serif;`;
        const ls = t.letterSpacing ? `letter-spacing:${t.letterSpacing}px;` : '';
        parts.push(
          `<div style="${base}${rot}font-size:${t.fontSize}mm;${fw}${fi}${fu}${fa}${ff}${ls}${bg}line-height:1.2;overflow:hidden;display:flex;align-items:center;">${escHtml(t.text)}</div>`,
        );
        break;
      }
      case 'variable': {
        const v = el as VariableElement;
        const val = variables[v.variableName] ?? v.defaultValue ?? '';
        parts.push(
          `<div style="${base}${rot}font-size:${v.fontSize}mm;line-height:1.2;overflow:hidden;">${escHtml(val)}</div>`,
        );
        break;
      }
      case 'counter': {
        const c = el as CounterElement;
        const num = String(c.startValue).padStart(c.padding, '0');
        parts.push(
          `<div style="${base}${rot}font-size:${c.fontSize}mm;line-height:1.2;overflow:hidden;">${escHtml(c.prefix + num)}</div>`,
        );
        break;
      }
      case 'datetime': {
        const d = el as DateTimeElement;
        parts.push(
          `<div style="${base}${rot}font-size:${d.fontSize}mm;line-height:1.2;overflow:hidden;">${escHtml(formatDate(new Date(), d.dateFormat))}</div>`,
        );
        break;
      }
      case 'qrcode': {
        const q = el as QRCodeElement;
        const sizePx = Math.round(Math.min(el.width, el.height) * MM_PX);
        const uri = await qrToDataUri(q.data, sizePx);
        parts.push(
          `<div style="${base}${rot}display:flex;align-items:center;justify-content:center;">` +
          `<img src="${uri}" style="width:${el.width}mm;height:${el.height}mm;image-rendering:pixelated;" /></div>`,
        );
        break;
      }
      case 'barcode': {
        const b = el as BarcodeElement;
        try {
          const uri = await barcodeToDataUri(b.data, b.barcodeType, el.width * MM_PX, el.height * MM_PX, b.showText);
          parts.push(
            `<div style="${base}${rot}display:flex;align-items:center;justify-content:center;">` +
            `<img src="${uri}" style="width:${el.width}mm;height:${el.height}mm;" /></div>`,
          );
        } catch {
          parts.push(
            `<div style="${base}${rot}border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:3mm;">${escHtml(b.data)}</div>`,
          );
        }
        break;
      }
      case 'shape': {
        const s = el as ShapeElement;
        const bw = `${s.borderWidth}mm`;
        if (s.shapeType === 'rectangle') {
          const fill = s.filled ? 'background:#000;' : '';
          const radius = s.cornerRadius ? `border-radius:${s.cornerRadius}mm;` : '';
          parts.push(`<div style="${base}${rot}border:${bw} solid #000;${fill}${radius}box-sizing:border-box;"></div>`);
        } else if (s.shapeType === 'ellipse') {
          const fill = s.filled ? 'background:#000;' : '';
          parts.push(`<div style="${base}${rot}border:${bw} solid #000;${fill}border-radius:50%;box-sizing:border-box;"></div>`);
        } else if (s.shapeType === 'line') {
          const isV = s.orientation === 'vertical';
          parts.push(
            `<div style="${base}${rot}">` +
            `<div style="${isV ? `width:${bw};height:100%;` : `width:100%;height:${bw};`}background:#000;"></div></div>`,
          );
        }
        break;
      }
      case 'image': {
        const img = el as ImageElement;
        let src = img.imageUrl ?? '';
        if (src) {
          try {
            const resp = await fetch(src);
            const blob = await resp.blob();
            src = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch { /* fallback URL diretta */ }
        }
        parts.push(
          `<div style="${base}${rot}overflow:hidden;">` +
          `<img src="${src}" style="width:100%;height:100%;object-fit:contain;" /></div>`,
        );
        break;
      }
    }
  }

  const gfUrl = buildGoogleFontsUrl([...usedFonts]);
  const gfLink = gfUrl
    ? `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link rel="stylesheet" href="${gfUrl}" />`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
${gfLink}
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:${widthMm}mm;height:${heightMm}mm;overflow:hidden;background:#fff;}
</style>
</head>
<body style="position:relative;width:${widthMm}mm;height:${heightMm}mm;">
${parts.join('\n')}
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PrintDialog({ open, onClose, templateId }: Props) {
  const { elements, labelConfig } = useEditorStore();
  const { enqueueSnackbar } = useSnackbar();
  const [copies, setCopies] = useState(1);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variableNames = elements
    .filter(el => el.type === 'variable')
    .map(el => (el as VariableElement).variableName)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const buildHtml = () =>
    elementsToHtml(elements, labelConfig.width, labelConfig.height, variables);

  const handlePrint = async () => {
    setLoading(true);
    setError(null);
    try {
      const html = await buildHtml();
      for (let i = 0; i < copies; i++) {
        const { data } = await axiosInstance.post('/printer/zplbox-print', {
          html,
          width: labelConfig.width,
          height: labelConfig.height,
        });
        if (!data.success) throw new Error(data.message ?? 'Errore ZplBox');
      }
      enqueueSnackbar(`Stampate ${copies} etichette`, { variant: 'success' });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Errore durante la stampa';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Stampa Etichetta</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

          <TextField
            label="Numero copie"
            type="number"
            value={copies}
            onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 9999 }}
          />

          {variableNames.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Variabili
              </Typography>
              {variableNames.map(name => (
                <TextField
                  key={name}
                  label={name}
                  value={variables[name] || ''}
                  onChange={e => setVariables(prev => ({ ...prev, [name]: e.target.value }))}
                  placeholder={`Valore per {{${name}}}`}
                />
              ))}
            </>
          )}

          <Typography variant="caption" color="text.secondary">
            Etichetta: {labelConfig.width} × {labelConfig.height} mm · {elements.length} elementi
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          onClick={handlePrint}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          sx={{ bgcolor: '#1e293b' }}
        >
          {loading ? 'Invio in corso...' : 'Stampa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
