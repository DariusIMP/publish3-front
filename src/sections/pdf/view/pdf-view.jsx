'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import { useState, useEffect } from 'react';
import { Page, pdfjs, Document } from 'react-pdf';
import { useBoolean } from 'minimal-shared/hooks';

import Card from '@mui/material/Card';

import { DashboardContent } from 'src/layouts/dashboard';

import { PdfToolbar } from '../pdf-toolbar';

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
