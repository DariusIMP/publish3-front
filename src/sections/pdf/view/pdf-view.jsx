'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { useState, useEffect } from 'react';
import { Page, pdfjs, Document } from 'react-pdf';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function PdfView({ pdf = 'Pdf', pdfPath, onFormSave, onDownload, onPrint, editable = false, initialScale = 1.5 }) {
  const [modifiedData, setDataModifications] = useState({});
  const [numPages, setNumPages] = useState(0);

  const enableEdit = useBoolean(editable);
  const [scale, setScale] = useState(initialScale);
  const maxScale = 3;
  const minScale = 1;

  function zoomIn() {
    let increased_scale = scale + 0.25;
    if (increased_scale <= maxScale) {
      setScale(increased_scale);
    }
  }

  function zoomOut() {
    let decreased_scale = scale - 0.25;
    if (decreased_scale >= minScale) {
      setScale(decreased_scale);
    }
  }

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    const inputValue = type === 'checkbox' ? checked : value;

    setDataModifications((prevData) => ({
      ...prevData,
      [name]: inputValue,
    }));
  };

  useEffect(() => {
    const annotationObserver = new MutationObserver(() => {
      const inputs = document.querySelectorAll('.react-pdf__Page__annotations input');
      inputs.forEach((input) => {
        if (!input.dataset.listenerAttached) {
          input.dataset.listenerAttached = 'listener';
          input.addEventListener('input', handleFormChange);
        }
      });
    });

    const pdfContainer = document.querySelector('.react-pdf__Document');
    if (pdfContainer) {
      annotationObserver.observe(pdfContainer, { childList: true, subtree: true });
    }

    return () => {
      annotationObserver.disconnect();
      const inputs = document.querySelectorAll('.react-pdf__Page__annotationLayer input');
      inputs.forEach((input) => {
        input.removeEventListener('input', handleFormChange);
      });
    };
  }, []);

  const onDocumentLoadSuccess = ({ numPages: totalNumPages }) => {
    setNumPages(totalNumPages); // Store total number of pages
  };

  return (
    <DashboardContent>
      <PdfToolbar
        onDownload={onDownload}
        onPrint={onPrint}
        onSave={async () => {
          enableEdit.onFalse();
          if (onFormSave) await onFormSave(modifiedData);
        }}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onEdit={enableEdit.onTrue}
        onEditCancel={enableEdit.onFalse}
      />

      <Card>
        <Document
          file={pdfPath}
          onLoadSuccess={onDocumentLoadSuccess}
          className="react-pdf__Document"
        >
          {[...Array(numPages)].map((_, index) => (
            <Page
              scale={scale}
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderAnnotationLayer
              renderForms={enableEdit.value}
            />
          ))}
        </Document>
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function PdfToolbar({
  onDownload,
  onPrint,
  onSave,
  onZoomIn,
  onZoomOut,
  onEdit,
  onEditCancel,
  editable = false,
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {onDownload && (
          <Tooltip title="Download">
            <IconButton onClick={onDownload}>
              <Iconify icon="eva:download-fill" />
            </IconButton>
          </Tooltip>
        )}

        {onPrint && (
          <Tooltip title="Print">
            <IconButton onClick={onPrint}>
              <Iconify icon="eva:printer-fill" />
            </IconButton>
          </Tooltip>
        )}

        {onZoomIn && (
          <Tooltip title="Zoom In">
            <IconButton onClick={onZoomIn}>
              <Iconify icon="eva:plus-circle-fill" />
            </IconButton>
          </Tooltip>
        )}

        {onZoomOut && (
          <Tooltip title="Zoom Out">
            <IconButton onClick={onZoomOut}>
              <Iconify icon="eva:minus-circle-fill" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {editable ? (
          <>
            <Button variant="outlined" color="inherit" onClick={onEditCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave}>
              Save
            </Button>
          </>
        ) : (
          onEdit && (
            <Button variant="outlined" onClick={onEdit}>
              Edit
            </Button>
          )
        )}
      </Stack>
    </Box>
  );
}
