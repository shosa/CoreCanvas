'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/axios';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  open: boolean;
  onClose: () => void;
  editId?: string;
  initialName?: string;
  initialDescription?: string;
}

export function SaveTemplateDialog({ open, onClose, editId, initialName, initialDescription }: Props) {
  const { elements, labelConfig } = useEditorStore();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState(initialName || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        width: labelConfig.width,
        height: labelConfig.height,
        elements,
      };

      if (editId) {
        await axiosInstance.put(`/templates/${editId}`, payload);
        enqueueSnackbar('Template aggiornato', { variant: 'success' });
      } else {
        await axiosInstance.post('/templates', payload);
        enqueueSnackbar('Template salvato', { variant: 'success' });
      }
      onClose();
    } catch (err: any) {
      enqueueSnackbar('Errore nel salvataggio', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editId ? 'Aggiorna Template' : 'Salva Template'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          label="Nome template"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          required
        />
        <TextField
          label="Descrizione (opzionale)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          sx={{ bgcolor: '#1e293b' }}
        >
          {loading ? 'Salvataggio...' : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
