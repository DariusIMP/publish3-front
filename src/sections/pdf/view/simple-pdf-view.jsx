'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { useState, useEffect } from 'react';
import { Page, pdfjs, Document } from 'react-pdf';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

// ----------------------------------------------------------------------

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function SimplePdfView({ pdfFile, scale = 1 }) {
  const [numPages, setNumPages] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Create object URL for the file
  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);

      // Clean up the object URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfFile]);

  const onDocumentLoadSuccess = ({ numPages: totalNumPages }) => {
    setNumPages(totalNumPages);
  };

  if (!pdfFile || !pdfUrl) {
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

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Card sx={{ p: 2 }}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="react-pdf__Document"
        >
          {[...Array(numPages)].map((_, index) => (
            <Box key={`page_${index + 1}`} sx={{ mb: 2 }}>
              <Page
                scale={scale}
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
