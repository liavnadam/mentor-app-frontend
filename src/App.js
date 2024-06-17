import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlockPage from './components/CodeBlockPage';  // Correct path assuming both components are in the same folder
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';


const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',  // A nice shade of blue
    },
    secondary: {
      main: '#19857b',  // A complementary green
    },
    error: {
      main: '#ff5252',  // Bright red for errors
    },
    background: {
      default: '#f4f5fd',  // A light grey background
    },
    success: {
      main: '#4caf50'   // Success green
    }
  },
  components: {
    // This ensures that the background color is applied throughout the application
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4f5fd',  // Use your desired background color here
        }
      }
    }
  },

  typography: {
    fontFamily: 'Roboto, sans-serif',
    button: {
      textTransform: 'none'  // Buttons use regular case text
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/code/:id" element={<CodeBlockPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
