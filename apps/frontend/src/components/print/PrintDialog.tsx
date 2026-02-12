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
import axiosInstance from '@/lib/axios';
import { useEditorStore } from '@/store/editorStore';
import { CanvasElement } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  templateId?: string;
}

export function PrintDialog({ open, onClose, templateId }: Props) {
  const { elements, labelConfig } = useEditorStore();
  const { enqueueSnackbar } = useSnackbar();
  const [copies, setCopies] = useState(1);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract variable names from elements
  const variableNames = elements
    .filter(el => el.type === 'variable')
    .map(el => (el as any).variableName as string)
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const handlePrint = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/printer/print', {
        elements,
        width: labelConfig.width,
        height: labelConfig.height,
        copies,
        variables: variableNames.length > 0 ? variables : undefined,
        templateId,
      });
      enqueueSnackbar(`Stampate ${copies} etichette`, { variant: 'success' });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Errore durante la stampa';
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
                  onChange={e =>
                    setVariables(prev => ({ ...prev, [name]: e.target.value }))
                  }
                  placeholder={`Valore per {{${name}}}`}
                />
              ))}
            </>
          )}

          <Typography variant="caption" color="text.secondary">
            Etichetta: {labelConfig.width} x {labelConfig.height} mm | {elements.length} elementi
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
