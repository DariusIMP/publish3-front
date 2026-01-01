'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Simple number formatting functions
function fNumber(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return '';
  const number = Number(inputValue);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(number);
}

function fPercent(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return '';
  const number = Number(inputValue);
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(number / 100);
}

// ----------------------------------------------------------------------

export function AppWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();

  const renderTrending = () => (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Iconify
        width={24}
        icon={
          percent < 0
            ? 'solar:double-alt-arrow-down-bold-duotone'
            : 'solar:double-alt-arrow-up-bold-duotone'
        }
        sx={{
          flexShrink: 0,
          color: 'success.main',
          ...(percent < 0 && { color: 'error.main' }),
        }}
      />

      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {percent > 0 && '+'}
        {fPercent(percent)}
      </Box>

      <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
        last 7 days
      </Box>
    </Box>
  );

  // Simple bar chart simulation
  const renderSimpleChart = () => {
    if (!chart?.series || !Array.isArray(chart.series)) {
      return null;
    }

    const maxValue = Math.max(...chart.series);
    const barHeight = 40;
    
    return (
      <Box sx={{ width: 60, height: barHeight, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
        {chart.series.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * barHeight : 0;
          const color = chart.colors?.[index] || theme.palette.primary.main;
          
          return (
            <Box
              key={index}
              sx={{
                width: 8,
                height: `${height}px`,
                backgroundColor: color,
                borderRadius: 1.5,
                transition: 'height 0.3s ease',
              }}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          display: 'flex',
          zIndex: 'unset',
          overflow: 'unset',
          alignItems: 'center',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>

        <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(total)}</Box>

        {renderTrending()}
      </Box>

      {renderSimpleChart()}
    </Card>
  );
}
