import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Button } from '@mui/material';
import SearchBar from './components/Reddit/SearchBar';
import AnalysisResult from './components/Reddit/AnalysisResult';
import AuthDialog from './components/Auth/AuthDialog';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface RedditPost {
  id: string;
  title: string;
  text: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  author: string;
  permalink: string;
}

interface Analysis {
  overall_sentiment: string;
  toxicity_level: number;
  frequent_words: string[];
  influential_accounts: string[];
}

interface SearchResponse {
  posts: RedditPost[];
  analysis: Analysis;
}

interface User {
  username: string;
  email: string;
}

function AppContent() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch search results: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error during search:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSearchResults(null);
  };

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Reddit Topic Analyzer
          </Typography>
          {user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => setIsAuthDialogOpen(true)}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        {error && (
          <div style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}
        {searchResults && (
          <AnalysisResult 
            posts={searchResults.posts} 
            analysis={searchResults.analysis}
            onClose={handleClose}
          />
        )}
        <AuthDialog
          open={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
          onAuthSuccess={() => setIsAuthDialogOpen(false)}
        />
      </Container>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 