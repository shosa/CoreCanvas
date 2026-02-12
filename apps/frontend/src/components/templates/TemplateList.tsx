'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import axiosInstance from '@/lib/axios';
import { useEditorStore } from '@/store/editorStore';
import { Template } from '@/types';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TemplateList({ open, onClose }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const { setElements, setLabelConfig } = useEditorStore();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) loadTemplates();
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/templates');
      setTemplates(data);
    } catch {
      enqueueSnackbar('Errore nel caricamento template', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      const { data } = await axiosInstance.get(`/templates/${id}`);
      if (data.design) {
        setElements(data.design.elements || []);
        setLabelConfig({
          width: data.design.labelConfig?.width || data.width,
          height: data.design.labelConfig?.height || data.height,
        });
      }
      enqueueSnackbar(`Template "${data.name}" caricato`, { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar('Errore nel caricamento', { variant: 'error' });
    }
  };

  const deleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/templates/${id}`);
      setTemplates(t => t.filter(tpl => tpl.id !== id));
      enqueueSnackbar('Template eliminato', { variant: 'success' });
    } catch {
      enqueueSnackbar('Errore nella eliminazione', { variant: 'error' });
    }
  };

  const duplicateTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.post(`/templates/${id}/duplicate`);
      loadTemplates();
      enqueueSnackbar('Template duplicato', { variant: 'success' });
    } catch {
      enqueueSnackbar('Errore nella duplicazione', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Template Salvati</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : templates.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Nessun template salvato
          </Typography>
        ) : (
          <List>
            {templates.map(tpl => (
              <ListItem
                key={tpl.id}
                onClick={() => loadTemplate(tpl.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#f1f5f9' },
                  mb: 0.5,
                }}
              >
                <ListItemText
                  primary={tpl.name}
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Chip label={`${tpl.width}x${tpl.height}mm`} size="small" sx={{ fontSize: 10 }} />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(tpl.updatedAt), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                      {tpl._count && (
                        <Typography variant="caption" color="text.secondary">
                          {tpl._count.printLogs} stampe
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Duplica">
                    <IconButton size="small" onClick={e => duplicateTemplate(tpl.id, e)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Elimina">
                    <IconButton size="small" onClick={e => deleteTemplate(tpl.id, e)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
