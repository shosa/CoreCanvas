'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar as MuiToolbar,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PrintIcon from '@mui/icons-material/Print';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/axios';
import { PrinterStatus } from '@/types';
import { PrinterConfigDialog } from '@/components/print/PrinterConfigDialog';

interface Props {
  onSave: () => void;
  onLoad: () => void;
  onPrint: () => void;
}

export function AppBar({ onSave, onLoad, onPrint }: Props) {
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const checkPrinter = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/printer/status');
      setPrinterStatus(data);
    } catch {
      setPrinterStatus({ online: false, host: '', port: 0, name: 'Stampante', message: 'Backend non raggiungibile' });
    }
  }, []);

  useEffect(() => {
    checkPrinter();
    const interval = setInterval(checkPrinter, 30000);
    return () => clearInterval(interval);
  }, [checkPrinter]);

  const online = printerStatus?.online ?? false;
  const printerName = printerStatus?.name || 'Stampante';

  return (
    <>
      <MuiAppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
        <MuiToolbar variant="dense" sx={{ gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <img src="/logo.png" alt="Logo" style={{ height: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
              CoreCanvas
            </Typography>
          </Box>

          <Button size="small" startIcon={<SaveIcon />} onClick={onSave}>
            Salva
          </Button>
          <Button size="small" startIcon={<FolderOpenIcon />} onClick={onLoad}>
            Apri
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={onPrint}
            disabled={!online}
            sx={{ bgcolor: '#1e293b' }}
          >
            Stampa
          </Button>

          <Box sx={{ flex: 1 }} />

          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: online ? '#10b981' : '#ef4444',
                    boxShadow: online
                      ? '0 0 6px rgba(16, 185, 129, 0.6)'
                      : '0 0 6px rgba(239, 68, 68, 0.6)',
                    flexShrink: 0,
                  }}
                />
                {`${printerName} - ${online ? 'online' : 'offline'}`}
              </Box>
            }
            size="small"
            variant="outlined"
            onClick={() => setConfigOpen(true)}
            sx={{ fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          />
        </MuiToolbar>
      </MuiAppBar>

      <PrinterConfigDialog
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSaved={checkPrinter}
      />
    </>
  );
}
