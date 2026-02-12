'use client';

import { useEffect, useRef } from 'react';
import {
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlipToFrontIcon from '@mui/icons-material/FlipToFront';
import FlipToBackIcon from '@mui/icons-material/FlipToBack';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  x: number;
  y: number;
  elementId: string | null;
  onClose: () => void;
}

export function ContextMenu({ x, y, elementId, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    deleteElement,
    duplicateElement,
    bringForward,
    sendBackward,
    setSelectedId,
    clearAll,
    elements,
  } = useEditorStore();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Paper
      ref={menuRef}
      elevation={8}
      sx={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 1000,
        minWidth: 200,
        py: 0.5,
        borderRadius: 1.5,
      }}
    >
      <MenuList dense>
        {elementId ? (
          <>
            <MenuItem onClick={() => handleAction(() => duplicateElement(elementId))}>
              <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Duplica</ListItemText>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                Ctrl+D
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => deleteElement(elementId))}>
              <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Elimina</ListItemText>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                Canc
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAction(() => bringForward(elementId))}>
              <ListItemIcon><FlipToFrontIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Porta avanti</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleAction(() => sendBackward(elementId))}>
              <ListItemIcon><FlipToBackIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Porta indietro</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleAction(() => setSelectedId(null))}>
              <ListItemIcon><DeselectIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Deseleziona</ListItemText>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                Esc
              </Typography>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem disabled={elements.length === 0} onClick={() => handleAction(() => clearAll())}>
              <ListItemIcon><DeleteSweepIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Cancella tutto</ListItemText>
            </MenuItem>
          </>
        )}
      </MenuList>
    </Paper>
  );
}
