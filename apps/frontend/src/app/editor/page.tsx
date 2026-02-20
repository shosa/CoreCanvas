'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { AppBar } from '@/components/layout/AppBar';
import { Toolbar } from '@/components/editor/Toolbar';
import { Canvas } from '@/components/editor/Canvas';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { LabelSettings } from '@/components/editor/LabelSettings';
import { PrintDialog } from '@/components/print/PrintDialog';
import { SaveTemplateDialog } from '@/components/templates/SaveTemplateDialog';
import { TemplateList } from '@/components/templates/TemplateList';

export default function EditorPage() {
  const [printOpen, setPrintOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        onSave={() => setSaveOpen(true)}
        onLoad={() => setLoadOpen(true)}
        onPrint={() => setPrintOpen(true)}
      />
      <Toolbar />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left sidebar - Label settings */}
        <Box sx={{ width: 280, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e2e8f0' }}>
          <LabelSettings />
        </Box>

        {/* Canvas */}
        <Canvas />

        {/* Right sidebar - Properties */}
        <PropertiesPanel />
      </Box>

      {/* Dialogs */}
      <PrintDialog open={printOpen} onClose={() => setPrintOpen(false)} />
      <SaveTemplateDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
      <TemplateList open={loadOpen} onClose={() => setLoadOpen(false)} />
    </Box>
  );
}
