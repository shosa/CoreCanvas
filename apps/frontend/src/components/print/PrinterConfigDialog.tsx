'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/axios';
import { PrinterConfig } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function PrinterConfigDialog({ open, onClose, onSaved }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<PrinterConfig>({
    id: 'default',
    name: 'Zebra ZT410',
    host: '192.168.3.44',
    port: 9100,
    dpi: 203,
  });

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get('/printer/config');
      setConfig(data);
    } catch {
      setError('Impossibile caricare la configurazione');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosInstance.put('/printer/config', {
        name: config.name,
        host: config.host,
        port: config.port,
        dpi: config.dpi,
      });
      enqueueSnackbar('Configurazione stampante salvata', { variant: 'success' });
      onSaved();
      onClose();
    } catch {
      setError('Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configurazione Stampante</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome stampante"
              value={config.name}
              onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
              placeholder="es. Zebra ZT410"
            />
            <TextField
              label="Indirizzo IP"
              value={config.host}
              onChange={e => setConfig(prev => ({ ...prev, host: e.target.value }))}
              placeholder="es. 192.168.3.44"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Porta"
                type="number"
                value={config.port}
                onChange={e => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 9100 }))}
                inputProps={{ min: 1, max: 65535 }}
              />
              <TextField
                label="DPI"
                type="number"
                value={config.dpi}
                onChange={e => setConfig(prev => ({ ...prev, dpi: parseInt(e.target.value) || 203 }))}
                inputProps={{ min: 150, max: 600 }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              La modifica viene applicata immediatamente al servizio di stampa.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading || !config.name || !config.host}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
          sx={{ bgcolor: '#1e293b' }}
        >
          {saving ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
