import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  onSearch: (topic: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearch(topic.trim());
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        maxWidth: 600,
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Reddit Topic Analyzer
      </Typography>
      
      <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter a topic to search on Reddit..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading || !topic.trim()}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Analyze'}
        </Button>
      </Box>
    </Box>
  );
};

export default SearchBar; 