import { m } from 'framer-motion';

import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varTap, varHover, transitionTap } from 'src/components/animate';

// ----------------------------------------------------------------------

export function ThemeModeButton({ sx, ...other }) {
  const { setMode, colorScheme } = useColorScheme();

  const toggleMode = () => {
    setMode(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <IconButton
      component={m.button}
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Toggle theme mode"
      onClick={toggleMode}
      sx={[{ p: 0, width: 40, height: 40 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <Iconify
        icon={colorScheme === 'light' ? 'solar:sun-bold' : 'solar:moon-bold'}
        width={24}
        height={24}
      />
    </IconButton>
  );
}
