'use client';

import { Box, Typography, TextField, Select, MenuItem, FormControlLabel, Switch, Divider, InputLabel, FormControl } from '@mui/material';
import { useEditorStore } from '@/store/editorStore';
import { CanvasElement, BarcodeType, ErrorCorrectionLevel } from '@/types';

const BARCODE_TYPES: { value: BarcodeType; label: string }[] = [
  { value: 'code128', label: 'Code 128' },
  { value: 'code39', label: 'Code 39' },
  { value: 'ean13', label: 'EAN-13' },
  { value: 'ean8', label: 'EAN-8' },
  { value: 'upca', label: 'UPC-A' },
  { value: 'code93', label: 'Code 93' },
  { value: 'itf', label: 'Interleaved 2 of 5' },
];

const DATE_FORMATS = [
  'dd/MM/yyyy HH:mm',
  'dd/MM/yyyy',
  'yyyy-MM-dd',
  'dd-MM-yyyy HH:mm:ss',
  'HH:mm:ss',
  'HH:mm',
];

export function PropertiesPanel() {
  const { selectedId, elements, updateElement } = useEditorStore();

  const selected = elements.find(el => el.id === selectedId);
  if (!selected) {
    return (
      <Box sx={{ width: 280, p: 2, bgcolor: 'background.paper', borderLeft: '1px solid #e2e8f0', overflow: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          Seleziona un elemento per modificarne le proprietà
        </Typography>
      </Box>
    );
  }

  const update = (updates: Partial<CanvasElement>) => {
    updateElement(selected.id, updates);
  };

  return (
    <Box sx={{ width: 280, p: 2, bgcolor: 'background.paper', borderLeft: '1px solid #e2e8f0', overflow: 'auto' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 }}>
        {selected.type === 'text' && 'Testo'}
        {selected.type === 'barcode' && 'Barcode'}
        {selected.type === 'qrcode' && 'QR Code'}
        {selected.type === 'shape' && 'Forma'}
        {selected.type === 'image' && 'Immagine'}
        {selected.type === 'variable' && 'Variabile'}
        {selected.type === 'counter' && 'Contatore'}
        {selected.type === 'datetime' && 'Data/Ora'}
      </Typography>

      {/* Position - common to all */}
      <Typography variant="caption" color="text.secondary">Posizione (mm)</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2, mt: 0.5 }}>
        <TextField label="X" type="number" value={Math.round(selected.x * 10) / 10}
          onChange={e => update({ x: parseFloat(e.target.value) || 0 })}
          inputProps={{ step: 0.5 }} />
        <TextField label="Y" type="number" value={Math.round(selected.y * 10) / 10}
          onChange={e => update({ y: parseFloat(e.target.value) || 0 })}
          inputProps={{ step: 0.5 }} />
        <TextField label="W" type="number" value={Math.round(selected.width * 10) / 10}
          onChange={e => update({ width: parseFloat(e.target.value) || 1 })}
          inputProps={{ step: 0.5, min: 1 }} />
        <TextField label="H" type="number" value={Math.round(selected.height * 10) / 10}
          onChange={e => update({ height: parseFloat(e.target.value) || 1 })}
          inputProps={{ step: 0.5, min: 1 }} />
      </Box>
      <TextField label="Rotazione" type="number" fullWidth sx={{ mb: 2 }}
        value={selected.rotation}
        onChange={e => update({ rotation: parseFloat(e.target.value) || 0 })}
        inputProps={{ step: 90, min: 0, max: 360 }} />

      <Divider sx={{ my: 2 }} />

      {/* Type-specific properties */}
      {selected.type === 'text' && (
        <>
          <TextField label="Testo" fullWidth multiline rows={2} sx={{ mb: 2 }}
            value={selected.text}
            onChange={e => update({ text: e.target.value })} />
          <TextField label="Dimensione font (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.fontSize}
            onChange={e => update({ fontSize: parseFloat(e.target.value) || 3 })}
            inputProps={{ step: 0.5, min: 1 }} />
          <FormControlLabel
            control={<Switch checked={selected.bold} onChange={e => update({ bold: e.target.checked })} />}
            label="Grassetto"
          />
          <FormControlLabel
            control={<Switch checked={selected.inverted} onChange={e => update({ inverted: e.target.checked })} />}
            label="Invertito (bianco su nero)"
          />
        </>
      )}

      {selected.type === 'barcode' && (
        <>
          <TextField label="Dati" fullWidth sx={{ mb: 2 }}
            value={selected.data}
            onChange={e => update({ data: e.target.value })} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo Barcode</InputLabel>
            <Select value={selected.barcodeType} label="Tipo Barcode"
              onChange={e => update({ barcodeType: e.target.value as BarcodeType })}>
              {BARCODE_TYPES.map(bt => (
                <MenuItem key={bt.value} value={bt.value}>{bt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Altezza barcode (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.barcodeHeight}
            onChange={e => update({ barcodeHeight: parseFloat(e.target.value) || 10 })}
            inputProps={{ step: 1, min: 5 }} />
          <TextField label="Larghezza modulo" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.moduleWidth}
            onChange={e => update({ moduleWidth: parseInt(e.target.value) || 2 })}
            inputProps={{ min: 1, max: 10 }} />
          <FormControlLabel
            control={<Switch checked={selected.showText} onChange={e => update({ showText: e.target.checked })} />}
            label="Mostra testo"
          />
        </>
      )}

      {selected.type === 'qrcode' && (
        <>
          <TextField label="Dati" fullWidth multiline rows={2} sx={{ mb: 2 }}
            value={selected.data}
            onChange={e => update({ data: e.target.value })} />
          <TextField label="Ingrandimento" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.magnification}
            onChange={e => update({ magnification: parseInt(e.target.value) || 4 })}
            inputProps={{ min: 1, max: 10 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Correzione errori</InputLabel>
            <Select value={selected.errorCorrection} label="Correzione errori"
              onChange={e => update({ errorCorrection: e.target.value as ErrorCorrectionLevel })}>
              <MenuItem value="L">Low (7%)</MenuItem>
              <MenuItem value="M">Medium (15%)</MenuItem>
              <MenuItem value="Q">Quartile (25%)</MenuItem>
              <MenuItem value="H">High (30%)</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {selected.type === 'shape' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo forma</InputLabel>
            <Select value={selected.shapeType} label="Tipo forma"
              onChange={e => update({ shapeType: e.target.value as any })}>
              <MenuItem value="rectangle">Rettangolo</MenuItem>
              <MenuItem value="line">Linea</MenuItem>
              <MenuItem value="ellipse">Ellisse</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Spessore bordo (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.borderWidth}
            onChange={e => update({ borderWidth: parseFloat(e.target.value) || 0.5 })}
            inputProps={{ step: 0.25, min: 0.25 }} />
          <FormControlLabel
            control={<Switch checked={selected.filled} onChange={e => update({ filled: e.target.checked })} />}
            label="Riempito"
          />
        </>
      )}

      {selected.type === 'variable' && (
        <>
          <TextField label="Nome variabile" fullWidth sx={{ mb: 2 }}
            value={selected.variableName}
            onChange={e => update({ variableName: e.target.value })} />
          <TextField label="Valore default" fullWidth sx={{ mb: 2 }}
            value={selected.defaultValue}
            onChange={e => update({ defaultValue: e.target.value })} />
          <TextField label="Dimensione font (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.fontSize}
            onChange={e => update({ fontSize: parseFloat(e.target.value) || 3 })}
            inputProps={{ step: 0.5, min: 1 }} />
        </>
      )}

      {selected.type === 'counter' && (
        <>
          <TextField label="Nome contatore" fullWidth sx={{ mb: 2 }}
            value={selected.counterName}
            onChange={e => update({ counterName: e.target.value })} />
          <TextField label="Valore iniziale" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.startValue}
            onChange={e => update({ startValue: parseInt(e.target.value) || 1 })} />
          <TextField label="Prefisso" fullWidth sx={{ mb: 2 }}
            value={selected.prefix}
            onChange={e => update({ prefix: e.target.value })} />
          <TextField label="Padding (cifre)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.padding}
            onChange={e => update({ padding: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 10 }} />
          <TextField label="Dimensione font (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.fontSize}
            onChange={e => update({ fontSize: parseFloat(e.target.value) || 3 })}
            inputProps={{ step: 0.5, min: 1 }} />
        </>
      )}

      {selected.type === 'datetime' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Formato data</InputLabel>
            <Select value={selected.dateFormat} label="Formato data"
              onChange={e => update({ dateFormat: e.target.value })}>
              {DATE_FORMATS.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Dimensione font (mm)" type="number" fullWidth sx={{ mb: 2 }}
            value={selected.fontSize}
            onChange={e => update({ fontSize: parseFloat(e.target.value) || 3 })}
            inputProps={{ step: 0.5, min: 1 }} />
        </>
      )}
    </Box>
  );
}
