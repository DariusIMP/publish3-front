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

export function AnalyticsWidgetSummary({ title, percent, total, chart, sx, ...other }) {
  const theme = useTheme();

  const renderTrending = () => (
    <Box sx={{ gap: 0.5, display: 'flex', alignItems: 'center' }}>
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          display: 'flex',
          borderRadius: '50%',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'success.lighter',
          color: 'success.dark',
          ...theme.applyStyles('dark', {
            color: 'success.light',
          }),
          ...(percent < 0 && {
            bgcolor: 'error.lighter',
            color: 'error.dark',
            ...theme.applyStyles('dark', {
              color: 'error.light',
            }),
          }),
        }}
      >
        <Iconify
          width={16}
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      </Box>

      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {percent > 0 && '+'}
        {fPercent(percent)}
      </Box>

      <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
        last week
      </Box>
    </Box>
  );

  // Simple line chart simulation
  const renderSimpleChart = () => {
    if (!chart?.series || !Array.isArray(chart.series)) {
      return null;
    }

    const maxValue = Math.max(...chart.series);
    const minValue = Math.min(...chart.series);
    const range = maxValue - minValue;
    const chartHeight = 56;
    const chartWidth = 84;
    const pointCount = chart.series.length;
    const pointSpacing = chartWidth / (pointCount - 1);
    
    // Create SVG path for line chart
    const points = chart.series.map((value, index) => {
      const x = index * pointSpacing;
      const y = range > 0 ? chartHeight - ((value - minValue) / range) * chartHeight : chartHeight / 2;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    return (
      <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
        <path
          d={pathData}
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {chart.series.map((value, index) => {
          const x = index * pointSpacing;
          const y = range > 0 ? chartHeight - ((value - minValue) / range) * chartHeight : chartHeight / 2;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={theme.palette.primary.main}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <Card
      sx={[{ p: 3, display: 'flex', alignItems: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ typography: 'subtitle2' }}>{title}</Box>

        <Box sx={{ my: 1.5, typography: 'h3' }}>{fNumber(total)}</Box>

        {renderTrending()}
      </Box>

      {renderSimpleChart()}
    </Card>
  );
}
