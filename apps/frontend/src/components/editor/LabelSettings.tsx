'use client';

import { Box, TextField, Typography, Button, Chip } from '@mui/material';
import { useEditorStore } from '@/store/editorStore';

const PRESETS = [
  { label: '174x76', width: 174, height: 76 },
  { label: '100x60', width: 100, height: 60 },
  { label: '150x100', width: 150, height: 100 },
  { label: '100x50', width: 100, height: 50 },
  { label: '80x40', width: 80, height: 40 },
  { label: '50x30', width: 50, height: 30 },
];

export function LabelSettings() {
  const { labelConfig, setLabelConfig } = useEditorStore();

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid #e2e8f0' }}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>
        Dimensioni etichetta (mm)
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
        <TextField
          label="Larghezza"
          type="number"
          size="small"
          value={labelConfig.width}
          onChange={e => setLabelConfig({ width: parseFloat(e.target.value) || 100 })}
          inputProps={{ min: 10, max: 300, step: 5 }}
          sx={{ width: 100 }}
        />
        <Typography variant="body2" color="text.secondary">x</Typography>
        <TextField
          label="Altezza"
          type="number"
          size="small"
          value={labelConfig.height}
          onChange={e => setLabelConfig({ height: parseFloat(e.target.value) || 60 })}
          inputProps={{ min: 10, max: 300, step: 5 }}
          sx={{ width: 100 }}
        />
        <Typography variant="caption" color="text.secondary">mm</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <Chip
            key={p.label}
            label={p.label}
            size="small"
            variant={labelConfig.width === p.width && labelConfig.height === p.height ? 'filled' : 'outlined'}
            onClick={() => setLabelConfig({ width: p.width, height: p.height })}
            sx={{ fontSize: 11 }}
          />
        ))}
      </Box>
    </Box>
  );
}
