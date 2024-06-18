import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Paper, Container, Box } from '@mui/material';

function Lobby() {
    const [codeBlocks, setCodeBlocks] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/codeblocks') // Adjust this URL to your server's URL
            .then(response => response.json())
            .then(data => setCodeBlocks(data))
            .catch(err => console.error("Failed to fetch code blocks:", err));
    }, []);

    return (
        <Box sx={{
            minHeight: '100vh', 
            backgroundColor: '#2e3440', // Dark background color
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
        }}>
            <Container component="main" maxWidth="sm">
                <Paper elevation={3} sx={{
                    p: 4, 
                    backgroundColor: '#3b4252', // Slightly lighter background for the paper component
                    color: '#eceff4', // Light text color
                    borderRadius: '15px',
                }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#eceff4', textAlign: 'center' }}>
                        Choose Code Block
                    </Typography>
                    <List sx={{
                        bgcolor: 'transparent', 
                        color: '#eceff4',
                    }}>
                        {codeBlocks.length > 0 ? codeBlocks.map(block => (
                            <ListItem 
                                key={block._id} 
                                button 
                                component={RouterLink} 
                                to={`/code/${block._id}`} 
                                sx={{
                                    borderRadius: '10px', 
                                    mb: 1, 
                                    backgroundColor: '#4c566a', // Color for list items
                                    '&:hover': { 
                                        backgroundColor: '#81a1c1', // Hover color for list items
                                        transition: 'background-color 0.3s ease',
                                    },
                                    transition: 'background-color 0.3s ease',
                                }}
                            >
                                <ListItemText primary={block.title} primaryTypographyProps={{ color: '#eceff4', fontWeight: 'bold' }} />
                            </ListItem>
                        )) : (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', color: '#eceff4' }}>
                                No code blocks available.
                            </Typography>
                        )}
                    </List>
                </Paper>
            </Container>
        </Box>
    );
}

export default Lobby;
