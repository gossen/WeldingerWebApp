import { createTheme } from '@mui/material'

/** Farben aus der Entwickler-Übergabe; Hell/Dunkel folgt dem System. */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1D5FD1' },
        background: { default: '#EFEFEA', paper: '#FFFFFF' },
        text: { primary: '#16181B', secondary: '#5C6269' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#6EA2FF' },
        background: { default: '#121416', paper: '#1C1F22' },
        text: { primary: '#ECEDEE', secondary: '#9EA4AA' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  components: {
    MuiToggleButton: { styleOverrides: { root: { minHeight: 44, textTransform: 'none' } } },
  },
})
