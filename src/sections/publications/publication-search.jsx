import { useState, useCallback } from 'react';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useDebounce } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Link, { linkClasses } from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete, { autocompleteClasses, createFilterOptions } from '@mui/material/Autocomplete';

import { RouterLink } from 'src/routes/components';

import { searchPublicationsByTitle } from 'src/actions/publications/action';

import { Iconify } from 'src/components/iconify';
import { SearchNotFound } from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export function PublicationSearch({ sx }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(searchQuery);

  // Load search results when query changes
  useState(() => {
    async function searchPublications() {
      if (!debouncedQuery.trim()) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchPublicationsByTitle(debouncedQuery);
        setOptions(results);
      } catch (error) {
        console.error('Error searching publications:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }

    searchPublications();
  }, [debouncedQuery]);

  const handleChange = useCallback((item) => {
    setSelectedItem(item);
    if (item) {
      // Navigate to publication details (to be implemented)
      // For now, just log it
      console.log('Selected publication:', item);
      // router.push(`/dashboard/publications/${item.id}`);
    }
  }, []);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: (option) => `${option.title} ${option.about || ''}`,
  });

  const paperStyles = {
    width: 320,
    [`& .${autocompleteClasses.listbox}`]: {
      [`& .${autocompleteClasses.option}`]: {
        p: 0,
        [`& .${linkClasses.root}`]: {
          p: 0.75,
          gap: 1.5,
          width: 1,
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  };

  return (
    <Autocomplete
      autoHighlight
      popupIcon={null}
      loading={loading}
      options={options}
      value={selectedItem}
      filterOptions={filterOptions}
      onChange={(event, newValue) => handleChange(newValue)}
      onInputChange={(event, newValue) => setSearchQuery(newValue)}
      getOptionLabel={(option) => option.title || ''}
      noOptionsText={<SearchNotFound query={debouncedQuery} />}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      slotProps={{ paper: { sx: paperStyles } }}
      sx={[{ width: { xs: 1, sm: 260 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search publications..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: -3 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option, state) => {
        const { key, ...otherProps } = props;
        const matches = match(option.title, state.inputValue, {
          insideWords: true,
        });
        const parts = parse(option.title, matches);

        return (
          <li key={key} {...otherProps}>
            <Link
              component={RouterLink}
              href={`/dashboard/publications/${option.id}`}
              color="inherit"
              underline="none"
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'action.hover',
                }}
              >
                <Iconify icon="solar:document-bold" width={24} />
              </Box>
              <div>
                {parts.map((part, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      ...(part.highlight && {
                        color: 'primary.main',
                        fontWeight: 'fontWeightSemiBold',
                      }),
                    }}
                  >
                    {part.text}
                  </Box>
                ))}
                {option.about && (
                  <Box
                    component="div"
                    sx={{
                      typography: 'caption',
                      color: 'text.secondary',
                      mt: 0.25,
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {option.about.substring(0, 60)}...
                  </Box>
                )}
              </div>
            </Link>
          </li>
        );
      }}
    />
  );
}
