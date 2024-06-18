import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { CircularProgress, Typography, TextField, Paper, Container, Button, Box, Modal, Backdrop, Fade } from '@mui/material';
import { styled } from '@mui/system';

const socket = io('http://localhost:5000');

// Create a styled component for a big smiley face
const SmileyFace = styled('div')({
  fontSize: '100px',
  color: '#FFD700', // Gold color for the smiley face
  textAlign: 'center',
  margin: '20px auto',
  animation: 'smileyBounce 1s infinite' // Add a bounce animation
});

// Define keyframes for bounce animation
const globalStyles = `
  @keyframes smileyBounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  body {
    background-color: #2e3440; /* Dark background for the entire page */
    margin: 0;
    font-family: 'Roboto', sans-serif;
  }
`;

// Apply global styles
document.head.insertAdjacentHTML('beforeend', `<style>${globalStyles}</style>`);

function CodeBlockPage() {
  const { id } = useParams();
  const [codeBlock, setCodeBlock] = useState({ code: '', title: '', solution: '', instructions: '' });
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false); // State to manage solution visibility

  const navigate = useNavigate();

  const changeRole = (newRole) => {
    sessionStorage.setItem(`role_${id}`, newRole);
    setRole(newRole);
    navigate(0); // Reload the page to reflect the role change
  };

  useEffect(() => {
    const fetchRoleAndData = async () => {
      let currentRole = sessionStorage.getItem(`role_${id}`) || 'mentor'; // Default to mentor

      try {
        const roleResponse = await fetch(`http://localhost:5000/codeblocks/${id}/role?role=${currentRole}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!roleResponse.ok) {
          throw new Error(`Role fetch failed with status: ${roleResponse.status}`);
        }

        const roleData = await roleResponse.json();
        setRole(roleData.role);

        // Fetch code block data
        const codeResponse = await fetch(`http://localhost:5000/codeblocks/${id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!codeResponse.ok) {
          throw new Error(`Code block fetch failed with status: ${codeResponse.status}`);
        }

        const codeData = await codeResponse.json();
        setCodeBlock(codeData);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleAndData();
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

  const handleShowSolution = () => {
    setShowSolution(true);
  };

  const handleCloseSolution = () => {
    setShowSolution(false);
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
              <Button
                onClick={handleShowSolution}
                sx={{
                  mt: 2,
                  ml: 2,
                  backgroundColor: '#f25c54',
                  '&:hover': { backgroundColor: '#f75e57' },
                }}
                variant="contained"
              >
                Show Solution
              </Button>
              {isCorrect !== null && (
                <Typography sx={{ mt: 2 }} color={isCorrect ? "success.main" : "error.main"}>
                  {isCorrect ? "Correct!" : "Incorrect, please try again."}
                </Typography>
              )}
            </>
          )}
          {isCorrect && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <SmileyFace>😊</SmileyFace>
            </Box>
          )}
          <Typography
            component="pre"
            variant="body2"
            sx={{
              mt: 2,
              p: 1,
              backgroundColor: '#4c566a',
              borderRadius: 1,
              overflowX: 'auto',
              color: '#eceff4',
            }}
          >
            <code dangerouslySetInnerHTML={{ __html: hljs.highlight(codeBlock.code, { language: 'javascript' }).value }} />
          </Typography>
          <Modal
            open={showSolution}
            onClose={handleCloseSolution}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={showSolution}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: '#3b4252',
                color: '#eceff4',
                border: '2px solid #ffd166',
                boxShadow: 24,
                p: 4,
                borderRadius: '10px',
              }}>
                <Typography variant="h6" component="h2">
                  Solution
                </Typography>
                <Typography sx={{ mt: 2, color: '#d8dee9' }}>
                  {codeBlock.solution}
                </Typography>
              </Box>
            </Fade>
          </Modal>
        </Paper>
      </Container>
    </Box>
  );
}

export default CodeBlockPage;
