import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, Paper, Container } from '@mui/material';

function Lobby() {
    const [codeBlocks, setCodeBlocks] = useState([]);

    useEffect(() => {
        fetch('https://mentor-app-backend-mentor-app.up.railway.app/codeblocks') // Adjust this URL to your server's URL
            .then(response => response.json())
            .then(data => setCodeBlocks(data))
            .catch(err => console.error("Failed to fetch code blocks:", err));
    }, []);

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'secondary.main', color: 'common.white' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.contrastText' }}>
                    Choose Code Block
                </Typography>
                <List sx={{ bgcolor: 'background.paper' }}>
                    {codeBlocks.length > 0 ? codeBlocks.map(block => (
                        <ListItem key={block._id} button component={RouterLink} to={`/code/${block._id}`} sx={{ '&:hover': { bgcolor: 'primary.light' }, transition: 'background-color 0.3s ease' }}>
                            <ListItemText primary={block.title} primaryTypographyProps={{ color: 'text.primary' }} />
                        </ListItem>
                    )) : <Typography color="text.secondary">No code blocks available.</Typography>}
                </List>
            </Paper>
        </Container>
    );
}

export default Lobby;
