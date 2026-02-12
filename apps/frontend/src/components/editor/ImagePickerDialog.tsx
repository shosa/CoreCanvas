'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { UploadedImage } from '@/types';
import { useSnackbar } from 'notistack';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (image: UploadedImage) => void;
}

export function ImagePickerDialog({ open, onClose, onSelect }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) loadImages();
  }, [open]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/images');
      setImages(data);
    } catch {
      enqueueSnackbar('Errore caricamento immagini', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post(
        `${axiosInstance.defaults.baseURL}/images/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      enqueueSnackbar('Immagine caricata', { variant: 'success' });
      await loadImages();
    } catch {
      enqueueSnackbar('Errore upload immagine', { variant: 'error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(`/images/${id}`);
      setImages(prev => prev.filter(img => img.id !== id));
      enqueueSnackbar('Immagine eliminata', { variant: 'success' });
    } catch {
      enqueueSnackbar('Errore eliminazione', { variant: 'error' });
    }
  };

  const handleSelect = async (img: UploadedImage) => {
    try {
      const { data } = await axiosInstance.get(`/images/${img.id}`);
      onSelect(data);
      onClose();
    } catch {
      enqueueSnackbar('Errore caricamento URL immagine', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Seleziona Immagine
        <Button
          size="small"
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Carica nuova
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : images.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              Nessuna immagine caricata. Usa il pulsante "Carica nuova" per aggiungerne una.
            </Typography>
          </Box>
        ) : (
          <ImageList cols={4} gap={8} sx={{ mt: 1 }}>
            {images.map(img => (
              <ImageListItem
                key={img.id}
                onClick={() => handleSelect(img)}
                sx={{
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  borderRadius: 1,
                  overflow: 'hidden',
                  '&:hover': { border: '2px solid #1e293b' },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8fafc',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {img.width}x{img.height}
                  </Typography>
                </Box>
                <ImageListItemBar
                  title={img.name}
                  titleTypographyProps={{ variant: 'caption', noWrap: true }}
                  actionIcon={
                    <IconButton
                      size="small"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                      onClick={(e) => handleDelete(img.id, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
}
