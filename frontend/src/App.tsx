import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import SearchBar from './components/Reddit/SearchBar';
import AnalysisResult from './components/Reddit/AnalysisResult';

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

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<RedditPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        {error && (
          <div style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        )}
        {searchResults.length > 0 && (
          <AnalysisResult posts={searchResults} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App; 