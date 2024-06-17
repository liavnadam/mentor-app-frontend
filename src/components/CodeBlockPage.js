import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { CircularProgress, Typography, TextField, Paper, Container, Button } from '@mui/material';

const socket = io('http://localhost:5000');

function CodeBlockPage() {
  const { id } = useParams();
  const [codeBlock, setCodeBlock] = useState({ code: '', title: '', solution: '', instructions: '' });
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem(`role_${id}`);
    if (storedRole) {
        console.log(`Using stored role for code block ID: ${id}`);
        setRole(storedRole);
        setIsLoading(false);
    } else {
        fetchRoleAndData();
    }
}, [id]);

const fetchRoleAndData = async () => {
    try {
        const roleResponse = await fetch(`http://localhost:5000/codeblocks/${id}/role`, {
            headers: { 'Cache-Control': 'no-cache' }
        });
        const roleData = await roleResponse.json();
        console.log(`Role fetched from server: ${roleData.role}`);
        sessionStorage.setItem(`role_${id}`, roleData.role);
        setRole(roleData.role);

        const codeResponse = await fetch(`http://localhost:5000/codeblocks/${id}`);
        const codeData = await codeResponse.json();
        setCodeBlock(codeData);
    } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data.");
    } finally {
        setIsLoading(false);
    }
};


  const handleCodeChange = (event) => {
    const newCode = event.target.value;
    setCodeBlock(current => ({ ...current, code: newCode }));
    socket.emit('codeChange', { code: newCode });
    setIsCorrect(null);
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
  console.log("Current role on render:", role);

  return (
    <Container maxWidth="md" sx={{ mt: 4, bgcolor: 'background.default', py: 2 }}>
      <Paper elevation={3} sx={{ p: 3, bgcolor: 'secondary.main', color: '#ffffff' }}>
        <Typography variant="h5" gutterBottom color="primary.contrastText">
          {codeBlock.title}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'primary.contrastText' }}>
          {codeBlock.instructions}
        </Typography>        
        <Typography variant="subtitle1" gutterBottom>
          Hello {role === 'mentor' ? 'Mentor' : 'Student'}
        </Typography>
        <TextField
          fullWidth
          multiline
          value={codeBlock.code}
          onChange={handleCodeChange}
          readOnly={role === 'mentor'}
          minRows={10}
          variant="outlined"
          sx={{ mt: 2, borderColor: 'primary.light' }}
          InputProps={{
            style: { backgroundColor: '#fff', color: '#333' },
            spellCheck: false
          }}
        />
        {role === 'student' && (
          <>
            <Button onClick={checkSolution} sx={{ mt: 2 }} variant="contained" color="primary">
              Check
            </Button>
            {isCorrect !== null && (
              <Typography sx={{ mt: 2 }} color={isCorrect ? "success.main" : "error.main"}>
                {isCorrect ? "Correct!" : "Incorrect, please try again."}
              </Typography>
            )}
          </>
        )}
        <Typography component="pre" variant="body2" color="text.secondary" sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <code dangerouslySetInnerHTML={{ __html: hljs.highlight(codeBlock.code, { language: 'javascript' }).value }} />
        </Typography>
      </Paper>
    </Container>
  );
}

export default CodeBlockPage;
