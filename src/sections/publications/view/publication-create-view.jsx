'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';

import { toast } from 'src/components/snackbar';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { getAuthorsList } from 'src/actions/authors';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';
import { getPublicationsList } from 'src/actions/publications/action';

import { Form, Field } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SimplePdfView } from 'src/sections/pdf/view/simple-pdf-view';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// ----------------------------------------------------------------------

const PublicationCreateSchema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  about: zod.string().optional(),
  tags: zod.string().optional(), // Will be stored as JSON string
  authors: zod.array(zod.any()).optional(),
  citations: zod.array(zod.any()).optional(),
  price: zod.number().min(0, { message: 'Price must be non-negative' }),
});

// ----------------------------------------------------------------------

// Simple upload area component
const UploadArea = ({ onDrop }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onDrop(files);
    }
  };

  return (
    <Box
      sx={{
        height: '400px',
        border: '2px dashed',
        borderColor: dragOver ? 'primary.main' : 'divider',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: dragOver ? 'action.hover' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        p: 3,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <Box
        sx={{
          width: 64,
          height: 64,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'action.hover',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ typography: 'h6', mb: 1 }}>Drop PDF file here</Box>
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
          or click to browse
        </Box>
        <Box sx={{ typography: 'caption', color: 'text.disabled', mt: 1 }}>
          Only PDF files are accepted
        </Box>
      </Box>
    </Box>
  );
};

// ----------------------------------------------------------------------

export function PublicationCreateView() {
  const router = useRouter();
  const fileIsLoaded = useBoolean(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [publications, setPublications] = useState([]);
  const [selectedCitations, setSelectedCitations] = useState([]);

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(PublicationCreateSchema),
    defaultValues: {
      title: '',
      about: '',
      tags: '[]',
      authors: [],
      citations: [],
      price: 0,
    },
  });

  const {
    handleSubmit,
    setValue,
  } = methods;

  useEffect(() => {
    async function loadAuthors() {
      try {
        const authorsData = await getAuthorsList();
        setAuthors(authorsData);
      } catch (error) {
        console.error('Error loading authors:', error);
      }
    }

    loadAuthors();
  }, []);

  useEffect(() => {
    async function loadPublications() {
      try {
        const publicationsData = await getPublicationsList();
        setPublications(publicationsData);
      } catch (error) {
        console.error('Error loading publications:', error);
      }
    }

    loadPublications();
  }, []);

  const handleDrop = useCallback((files) => {
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      fileIsLoaded.onTrue();
    } else {
      toast.error('Please select a PDF file');
    }
  }, [fileIsLoaded]);

  const handleAddTag = () => {
    if (inputTag.trim() && !tags.includes(inputTag.trim())) {
      const newTags = [...tags, inputTag.trim()];
      setTags(newTags);
      methods.setValue('tags', JSON.stringify(newTags));
      setInputTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    methods.setValue('tags', JSON.stringify(newTags));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedFile) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    // Convert price from Move to octas (1 Move = 10^8 octas)
    const priceInOctas = Math.round(data.price * 10 ** 8);
    if (priceInOctas < 0) {
      toast.error('Price must be non-negative');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Add file
      formData.append('file', selectedFile);

      // Add other fields
      formData.append('title', data.title);
      if (data.about) {
        formData.append('about', data.about);
      }
      if (data.tags && data.tags !== '[]') {
        formData.append('tags', data.tags);
      }

      // Add blockchain fields (price in octas)
      formData.append('price', priceInOctas);

      // Add authors as JSON array if any are selected
      if (selectedAuthors.length > 0) {
        const authorIds = selectedAuthors.map(author => author.privy_id);
        formData.append('authors', JSON.stringify(authorIds));
      }

      // Add citations as JSON array if any are selected
      if (selectedCitations.length > 0) {
        const citationIds = selectedCitations.map(pub => pub.id);
        formData.append('citations', JSON.stringify(citationIds));
      }

      // Send request with multipart/form-data
      const response = await axiosInstance.post(endpoints.publications.create, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.info('Publication created successfully:', response.data);

      const publicationId = response.data.id;
      router.push(paths.dashboard.publications.read(publicationId));
    } catch (error) {
      console.error('Failed to create publication:', error);
      toast.error(`Failed to create publication: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <DashboardContent maxWidth={false}>
      <CustomBreadcrumbs
        heading="Upload New Paper"
        backHref={paths.dashboard.publications.list}
        links={[
          { name: 'Publications', href: paths.dashboard.publications.list },
          { name: 'Upload Paper' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Form methods={methods} onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 2 }}>
          {/* Left side: PDF upload */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {fileIsLoaded.value ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ typography: 'h6' }}>Selected File</Box>
                    <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                      {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                      fileIsLoaded.onFalse();
                    }}
                  >
                    Change File
                  </Button>
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <SimplePdfView pdfFile={selectedFile} />
                </Box>
              </Box>
            ) : (
              <UploadArea onDrop={handleDrop} />
            )}
          </Box>

          {/* Right side: Form fields */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              borderLeft: '1px solid',
              borderColor: 'divider',
              padding: 3,
            }}
          >
            <Box sx={{ mt: 2 }}>
              <Field.Text
                name="title"
                label="Paper Title"
                fullWidth
                variant="outlined"
                placeholder="Enter the title of the paper"
                required
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Field.Text
                name="about"
                label="Abstract / Description"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter a brief abstract or description of the paper"
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <InputLabel sx={{ mb: 1 }}>Tags</InputLabel>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <input type="hidden" {...methods.register('tags')} />
            </Box>


            {/* Authors section */}
            <Box sx={{ mt: 3 }}>
              <InputLabel sx={{ mb: 1 }}>Authors</InputLabel>
              <Autocomplete
                multiple
                options={authors}
                getOptionLabel={(option) => `${option.name}${option.email ? ` (${option.email})` : ''}`}
                isOptionEqualToValue={(option, value) => option?.privy_id === value?.privy_id}
                value={selectedAuthors}
                onChange={(event, value) => {
                  setSelectedAuthors(value);
                  setValue('authors', value, { shouldValidate: true });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select authors"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.privy_id}
                      label={option.name}
                      size="small"
                      color="info"
                      variant="soft"
                    />
                  ))
                }
              />
            </Box>

            {/* Price field */}
            <Box sx={{ mt: 3 }}>
              <Field.Text
                name="price"
                label="Price (in Move)"
                fullWidth
                variant="outlined"
                type="number"
                placeholder="Enter price in Move (1 Move = 100,000,000 octas)"
                InputProps={{
                  inputProps: { min: 0, step: "0.00000001" }
                }}
              />
            </Box>

            {/* Citations section */}
            <Box sx={{ mt: 3 }}>
              <InputLabel sx={{ mb: 1 }}>Citations</InputLabel>
              <Autocomplete
                multiple
                options={publications}
                getOptionLabel={(option) => `${option.title}${option.about ? ` - ${option.about.substring(0, 50)}...` : ''}`}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                value={selectedCitations}
                onChange={(event, value) => {
                  setSelectedCitations(value);
                  setValue('citations', value, { shouldValidate: true });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select publications to cite"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.title.substring(0, 30) + (option.title.length > 30 ? '...' : '')}
                      size="small"
                      color="secondary"
                      variant="soft"
                    />
                  ))
                }
              />
            </Box>

            <Box
              sx={{
                mt: 4,
                gap: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-end', sm: 'center' },
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => router.push(paths.dashboard.publications.list)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                loading={isSubmitting}
                disabled={!selectedFile}
              >
                Upload Paper
              </Button>
            </Box>
          </Box>
        </Box>
      </Form>
    </DashboardContent>
  );
}
