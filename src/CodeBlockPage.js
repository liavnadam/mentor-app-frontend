import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { CircularProgress, Typography, TextField, Paper, Container, Button, Box, Modal, Backdrop, Fade } from '@mui/material';
import { styled } from '@mui/system';

const socket = io('https://mentor-app-backend-mentor-app.up.railway.app');

function CodeBlockPage() {
  const { id } = useParams();
  const [codeBlock, setCodeBlock] = useState({ code: '', title: '', solution: '', instructions: '' });
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const navigate = useNavigate();

  const changeRole = async (newRole) => {
    try {
      const response = await fetch(`https://mentor-app-backend-mentor-app.up.railway.app/codeblocks/${id}/role?role=${newRole}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setRole(data.role);
      navigate(0); // Reload the page to reflect the role change
    } catch (error) {
      console.error('Failed to switch role:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchCodeBlockData = async () => {
      try {
        const response = await fetch(`https://mentor-app-backend-mentor-app.up.railway.app/codeblocks/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCodeBlock(data);
      } catch (err) {
        console.error('Error fetching code block data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodeBlockData();
  }, [id]);

  useEffect(() => {
    socket.on('codeUpdate', (data) => {
      setCodeBlock(current => ({ ...current, code: data.code }));
    });

    return () => {
      socket.off('codeUpdate');
    };
  }, []);

  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setCodeBlock(current => ({ ...current, code: newCode }));
    socket.emit('codeChange', { code: newCode });
    setIsCorrect(false); // Reset the correctness check
  };

  const checkSolution = () => {
    setIsCorrect(codeBlock.code.trim() === codeBlock.solution.trim());
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', 
      backgroundColor: '#2e3440', // Dark background color
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Container
        maxWidth="md"
        sx={{
          py: 2,
          backgroundColor: '#3b4252', // Slightly lighter background for the content area
          borderRadius: '15px',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          color: '#eceff4',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: '#3b4252', // Matching the container color
            color: '#eceff4',
            borderRadius: '15px',
          }}
        >
          <Typography variant="h5" gutterBottom>
            {codeBlock.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#d8dee9' }}>
            {codeBlock.instructions}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Hello {role === 'mentor' ? 'Mentor' : 'Student'}
          </Typography>
          <Button
            onClick={() => changeRole(role === 'mentor' ? 'student' : 'mentor')}
            sx={{
              mt: 2,
              backgroundColor: '#88c0d0',
              '&:hover': { backgroundColor: '#81a1c1' },
            }}
            variant="contained"
          >
            Switch to {role === 'mentor' ? 'Student' : 'Mentor'}
          </Button>
          <TextField
            fullWidth
            multiline
            value={codeBlock.code}
            onChange={handleCodeChange}
            readOnly={role === 'mentor'}
            minRows={10}
            disabled={role === 'mentor'}
            variant="outlined"
            sx={{
              mt: 2,
              backgroundColor: '#4c566a',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#d8dee9',
                },
                '&:hover fieldset': {
                  borderColor: '#88c0d0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#88c0d0',
                },
                input: {
                  color: '#eceff4',
                },
              },
            }}
          />
          {role === 'student' && (
            <>
              <Button
                onClick={checkSolution}
                sx={{
                  mt: 2,
                  backgroundColor: '#8fbcbb',
                  '&:hover': { backgroundColor: '#88c0d0' },
                }}
                variant="contained"
              >
                Check
              </Button>
              {isCorrect !== null && (
                <Typography sx={{ mt: 2 }} color={isCorrect ? "success.main" : "error.main"}>
                  {isCorrect ? "Correct!" : "Incorrect, please try again."}
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default CodeBlockPage;
