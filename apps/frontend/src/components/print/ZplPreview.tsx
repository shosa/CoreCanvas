'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/axios';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ZplPreview({ open, onClose }: Props) {
  const { elements, labelConfig } = useEditorStore();
  const { enqueueSnackbar } = useSnackbar();
  const [zpl, setZpl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      generatePreview();
    }
  }, [open]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/printer/preview', {
        elements,
        width: labelConfig.width,
        height: labelConfig.height,
      });
      setZpl(data.zpl);
    } catch (err: any) {
      setZpl('Errore nella generazione ZPL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(zpl);
    enqueueSnackbar('ZPL copiato negli appunti', { variant: 'success' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Anteprima ZPL
        <IconButton onClick={copyToClipboard} size="small">
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            component="pre"
            sx={{
              bgcolor: '#1e293b',
              color: '#e2e8f0',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: 13,
              fontFamily: 'monospace',
              maxHeight: 500,
              whiteSpace: 'pre-wrap',
            }}
          >
            {zpl}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
}
