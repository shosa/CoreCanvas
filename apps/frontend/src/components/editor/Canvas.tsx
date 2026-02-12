'use client';

import dynamic from 'next/dynamic';
import { Box, CircularProgress } from '@mui/material';

const CanvasInner = dynamic(() => import('./CanvasInner').then(mod => mod.CanvasInner), {
  ssr: false,
  loading: () => (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#e2e8f0' }}>
      <CircularProgress />
    </Box>
  ),
});

export function Canvas() {
  return <CanvasInner />;
}
