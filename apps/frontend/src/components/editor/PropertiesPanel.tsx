'use client';

import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  InputLabel,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import { useEditorStore } from '@/store/editorStore';
import { CanvasElement, BarcodeType, ErrorCorrectionLevel, TextAlign } from '@/types';

// Font names corrispondono esattamente ai Google Fonts caricati nel layout
// e alle alternative usate in stampa (PrintDialog) — WYSIWYG garantito
const FONT_FAMILIES = [
  'Arimo',          // alternativa metrica ad Arial/Helvetica/Verdana
  'Tinos',          // alternativa metrica a Times New Roman/Georgia
  'Courier Prime',  // alternativa metrica a Courier New
  'Anton',          // alternativa a Impact
  'Comic Neue',     // alternativa a Comic Sans MS
  'EB Garamond',    // alternativa a Palatino Linotype
];

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

  // Per gli elementi testo: ricalcola height automaticamente quando cambia fontSize
  const updateTextFontSize = (rawValue: string) => {
    const fs = Math.max(1, Math.round(parseFloat(rawValue) || 1));
    const autoHeight = fs * 1.2 + 2 / 3.7795; // 2px / (96px/in / (25.4mm/in)) ≈ 0.53mm
    update({ fontSize: fs, height: autoHeight });
  };

  const labelTitle =
    selected.type === 'text' ? 'Testo' :
    selected.type === 'barcode' ? 'Barcode' :
    selected.type === 'qrcode' ? 'QR Code' :
    selected.type === 'shape' ? 'Forma' :
    selected.type === 'image' ? 'Immagine' :
    selected.type === 'variable' ? 'Variabile' :
    selected.type === 'counter' ? 'Contatore' :
    'Data/Ora';

  return (
    <Box sx={{ width: 280, p: 1.5, bgcolor: 'background.paper', borderLeft: '1px solid #e2e8f0', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, color: 'text.secondary' }}>
        {labelTitle}
      </Typography>

      {/* Position & Size */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          Posizione e dimensione (mm)
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TextField size="small" label="X" type="number" value={Math.round(selected.x * 10) / 10}
            onChange={e => update({ x: parseFloat(e.target.value) || 0 })}
            inputProps={{ step: 0.5 }} />
          <TextField size="small" label="Y" type="number" value={Math.round(selected.y * 10) / 10}
            onChange={e => update({ y: parseFloat(e.target.value) || 0 })}
            inputProps={{ step: 0.5 }} />
          <TextField size="small" label="Larghezza" type="number" value={Math.round(selected.width * 10) / 10}
            onChange={e => update({ width: parseFloat(e.target.value) || 1 })}
            inputProps={{ step: 0.5, min: 1 }} />
          {/* Altezza nascosta per testi (auto dal fontSize) */}
          {!['text', 'variable', 'counter', 'datetime'].includes(selected.type) && (
            <TextField size="small" label="Altezza" type="number" value={Math.round(selected.height * 10) / 10}
              onChange={e => update({ height: parseFloat(e.target.value) || 1 })}
              inputProps={{ step: 0.5, min: 1 }} />
          )}
        </Box>
        <TextField size="small" label="Rotazione (°)" type="number" fullWidth sx={{ mt: 1 }}
          value={selected.rotation}
          onChange={e => update({ rotation: parseFloat(e.target.value) || 0 })}
          inputProps={{ step: 90, min: 0, max: 360 }} />
      </Box>

      <Divider />

      {/* TEXT */}
      {selected.type === 'text' && (
        <>
          <TextField size="small" label="Testo" fullWidth multiline rows={2}
            value={selected.text}
            onChange={e => update({ text: e.target.value })} />

          {/* Font family */}
          <FormControl size="small" fullWidth>
            <InputLabel>Font</InputLabel>
            <Select
              value={selected.fontFamily || 'Arial'}
              label="Font"
              onChange={e => update({ fontFamily: e.target.value })}
              renderValue={v => (
                <span style={{ fontFamily: v as string }}>{v as string}</span>
              )}
            >
              {FONT_FAMILIES.map(f => (
                <MenuItem key={f} value={f} style={{ fontFamily: f }}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Font size — solo interi, height ricalcolata automaticamente */}
          <TextField size="small" label="Dimensione (mm)" type="number" fullWidth
            value={Math.round(selected.fontSize)}
            onChange={e => updateTextFontSize(e.target.value)}
            inputProps={{ step: 1, min: 1 }} />

          {/* Style: Bold / Italic / Underline */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Stile
            </Typography>
            <ToggleButtonGroup size="small" sx={{ flexWrap: 'wrap' }}>
              <Tooltip title="Grassetto">
                <ToggleButton
                  value="bold"
                  selected={selected.bold}
                  onChange={() => update({ bold: !selected.bold })}
                >
                  <FormatBoldIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Corsivo">
                <ToggleButton
                  value="italic"
                  selected={selected.italic}
                  onChange={() => update({ italic: !selected.italic })}
                >
                  <FormatItalicIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Sottolineato">
                <ToggleButton
                  value="underline"
                  selected={selected.underline}
                  onChange={() => update({ underline: !selected.underline })}
                >
                  <FormatUnderlinedIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          {/* Alignment */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Allineamento
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={selected.align || 'left'}
              onChange={(_, v) => { if (v) update({ align: v as TextAlign }); }}
            >
              <Tooltip title="Sinistra">
                <ToggleButton value="left"><FormatAlignLeftIcon fontSize="small" /></ToggleButton>
              </Tooltip>
              <Tooltip title="Centro">
                <ToggleButton value="center"><FormatAlignCenterIcon fontSize="small" /></ToggleButton>
              </Tooltip>
              <Tooltip title="Destra">
                <ToggleButton value="right"><FormatAlignRightIcon fontSize="small" /></ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>
          </Box>

          {/* Letter spacing */}
          <TextField size="small" label="Spaziatura lettere (px)" type="number" fullWidth
            value={selected.letterSpacing ?? 0}
            onChange={e => update({ letterSpacing: parseFloat(e.target.value) || 0 })}
            inputProps={{ step: 0.5, min: -5 }} />

          {/* Inverted */}
          <FormControlLabel
            control={<Switch size="small" checked={selected.inverted} onChange={e => update({ inverted: e.target.checked })} />}
            label={<Typography variant="body2">Invertito (bianco su nero)</Typography>}
          />
        </>
      )}

      {/* BARCODE */}
      {selected.type === 'barcode' && (
        <>
          <TextField size="small" label="Dati" fullWidth
            value={selected.data}
            onChange={e => update({ data: e.target.value })} />
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo Barcode</InputLabel>
            <Select value={selected.barcodeType} label="Tipo Barcode"
              onChange={e => update({ barcodeType: e.target.value as BarcodeType })}>
              {BARCODE_TYPES.map(bt => (
                <MenuItem key={bt.value} value={bt.value}>{bt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Altezza barcode (mm)" type="number" fullWidth
            value={selected.barcodeHeight}
            onChange={e => update({ barcodeHeight: parseFloat(e.target.value) || 10 })}
            inputProps={{ step: 1, min: 5 }} />
          <TextField size="small" label="Larghezza modulo" type="number" fullWidth
            value={selected.moduleWidth}
            onChange={e => update({ moduleWidth: parseInt(e.target.value) || 2 })}
            inputProps={{ min: 1, max: 10 }} />
          <FormControlLabel
            control={<Switch size="small" checked={selected.showText} onChange={e => update({ showText: e.target.checked })} />}
            label={<Typography variant="body2">Mostra testo</Typography>}
          />
        </>
      )}

      {/* QRCODE */}
      {selected.type === 'qrcode' && (
        <>
          <TextField size="small" label="Dati" fullWidth multiline rows={2}
            value={selected.data}
            onChange={e => update({ data: e.target.value })} />
          <TextField size="small" label="Ingrandimento" type="number" fullWidth
            value={selected.magnification}
            onChange={e => update({ magnification: parseInt(e.target.value) || 4 })}
            inputProps={{ min: 1, max: 10 }} />
          <FormControl size="small" fullWidth>
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

      {/* SHAPE */}
      {selected.type === 'shape' && (
        <>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo forma</InputLabel>
            <Select value={selected.shapeType} label="Tipo forma"
              onChange={e => update({ shapeType: e.target.value as any })}>
              <MenuItem value="rectangle">Rettangolo</MenuItem>
              <MenuItem value="line">Linea</MenuItem>
              <MenuItem value="ellipse">Ellisse</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Spessore bordo (mm)" type="number" fullWidth
            value={selected.borderWidth}
            onChange={e => update({ borderWidth: parseFloat(e.target.value) || 0.5 })}
            inputProps={{ step: 0.25, min: 0.25 }} />
          {selected.shapeType === 'rectangle' && (
            <TextField size="small" label="Raggio angoli (mm)" type="number" fullWidth
              value={selected.cornerRadius ?? 0}
              onChange={e => update({ cornerRadius: parseFloat(e.target.value) || 0 })}
              inputProps={{ step: 0.5, min: 0 }} />
          )}
          {selected.shapeType === 'line' && (
            <FormControl size="small" fullWidth>
              <InputLabel>Orientamento</InputLabel>
              <Select value={selected.orientation || 'horizontal'} label="Orientamento"
                onChange={e => update({ orientation: e.target.value as any })}>
                <MenuItem value="horizontal">Orizzontale</MenuItem>
                <MenuItem value="vertical">Verticale</MenuItem>
              </Select>
            </FormControl>
          )}
          <FormControlLabel
            control={<Switch size="small" checked={selected.filled} onChange={e => update({ filled: e.target.checked })} />}
            label={<Typography variant="body2">Riempito</Typography>}
          />
        </>
      )}

      {/* IMAGE */}
      {selected.type === 'image' && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {selected.originalName}
          </Typography>
        </>
      )}

      {/* VARIABLE */}
      {selected.type === 'variable' && (
        <>
          <TextField size="small" label="Nome variabile" fullWidth
            value={selected.variableName}
            onChange={e => update({ variableName: e.target.value })} />
          <TextField size="small" label="Valore default" fullWidth
            value={selected.defaultValue}
            onChange={e => update({ defaultValue: e.target.value })} />
          <TextField size="small" label="Dimensione font (mm)" type="number" fullWidth
            value={Math.round(selected.fontSize)}
            onChange={e => updateTextFontSize(e.target.value)}
            inputProps={{ step: 1, min: 1 }} />
        </>
      )}

      {/* COUNTER */}
      {selected.type === 'counter' && (
        <>
          <TextField size="small" label="Nome contatore" fullWidth
            value={selected.counterName}
            onChange={e => update({ counterName: e.target.value })} />
          <TextField size="small" label="Valore iniziale" type="number" fullWidth
            value={selected.startValue}
            onChange={e => update({ startValue: parseInt(e.target.value) || 1 })} />
          <TextField size="small" label="Prefisso" fullWidth
            value={selected.prefix}
            onChange={e => update({ prefix: e.target.value })} />
          <TextField size="small" label="Padding (cifre)" type="number" fullWidth
            value={selected.padding}
            onChange={e => update({ padding: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 0, max: 10 }} />
          <TextField size="small" label="Dimensione font (mm)" type="number" fullWidth
            value={Math.round(selected.fontSize)}
            onChange={e => updateTextFontSize(e.target.value)}
            inputProps={{ step: 1, min: 1 }} />
        </>
      )}

      {/* DATETIME */}
      {selected.type === 'datetime' && (
        <>
          <FormControl size="small" fullWidth>
            <InputLabel>Formato data</InputLabel>
            <Select value={selected.dateFormat} label="Formato data"
              onChange={e => update({ dateFormat: e.target.value })}>
              {DATE_FORMATS.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Dimensione font (mm)" type="number" fullWidth
            value={Math.round(selected.fontSize)}
            onChange={e => updateTextFontSize(e.target.value)}
            inputProps={{ step: 1, min: 1 }} />
        </>
      )}
    </Box>
  );
}
