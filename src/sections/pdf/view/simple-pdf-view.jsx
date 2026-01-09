'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { useState, useEffect } from 'react';
import { Page, pdfjs, Document } from 'react-pdf';
import { useResizeDetector } from 'react-resize-detector';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function SimplePdfView({ pdfFile, pdfUrl: externalPdfUrl, scale = 1 }) {
  const { ref, width } = useResizeDetector();

  const [numPages, setNumPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = null;
    if (pdfFile) {
      url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      setError(null);
    } else if (externalPdfUrl) {
      setPdfUrl(externalPdfUrl);
      setError(null);
    } else {
      setPdfUrl(null);
    }
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pdfFile, externalPdfUrl]);

  const onDocumentLoadSuccess = ({ numPages: totalNumPages }) => {
    setNumPages(totalNumPages);
    setError(null);
    return undefined;
  };

  function onDocumentLoadError(err) {
    console.error('Error loading PDF:', err);
    setError('Failed to load PDF. The file may be corrupted or inaccessible.');
  }

  if (!pdfUrl) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ typography: 'body1', color: 'text.secondary' }}>
            No PDF file selected
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ typography: 'body1', color: 'error.main' }}>
            {error}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Card ref={ref} sx={{ p: 2, width: '100%' }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="react-pdf__Document"
        >
          {[...Array(numPages)].map((_, index) => (
            <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
              <Page
                width={width}
                pageNumber={index + 1}
                renderAnnotationLayer={false}
                renderForms={false}
              />
            </Box>
          ))}
        </Document>
      </Card>
    </Box>
  );
}
