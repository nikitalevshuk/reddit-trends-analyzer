import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Chip,
  Link,
} from '@mui/material';
import { LogoutOutlined, SearchOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';

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

interface SearchResponse {
  posts: RedditPost[];
  analysis: {
    summary?: string;
    topics?: string[];
    sentiment?: string;
  };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTopic, setSearchTopic] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);

  const queryOptions: UseQueryOptions<SearchResponse, Error> = {
    queryKey: ['redditSearch', searchTopic],
    queryFn: async () => {
      console.log('Sending request with topic:', searchTopic);
      const response = await axios.post<SearchResponse>('http://localhost:8000/api/search', {
        topic: searchTopic,
        limit: 10,
      });
      console.log('Received response:', response.data);
      return response.data;
    },
    enabled: searchEnabled && !!searchTopic,
    refetchOnWindowFocus: false,
    retry: 1,
    onSuccess: () => {
      setSearchEnabled(false);
    }
  };

  const { data, isLoading, error } = useQuery<SearchResponse, Error>(queryOptions);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEnabled(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Reddit Topic Analyzer
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutOutlined />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                fullWidth
                label="Search Topic"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="Enter a topic to analyze"
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                type="submit"
                startIcon={<SearchOutlined />}
                disabled={isLoading}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            Error: {error.message || 'Failed to fetch results'}
          </Typography>
        )}

        {data && (
          <>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analysis Results
                </Typography>
                
                {/* Debug info */}
                <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Debug Info:
                  </Typography>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {JSON.stringify(data.analysis, null, 2)}
                  </pre>
                </Box>

                {data.analysis?.summary ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Summary:
                    </Typography>
                    <Typography paragraph>{data.analysis.summary}</Typography>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No summary available</Typography>
                )}

                {data.analysis?.topics && data.analysis.topics.length > 0 ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Key Topics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {data.analysis.topics.map((topic: string, index: number) => (
                        <Chip
                          key={index}
                          label={topic}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">No topics identified</Typography>
                )}

                {data.analysis?.sentiment ? (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Overall Sentiment:
                    </Typography>
                    <Chip
                      label={data.analysis.sentiment}
                      color={
                        data.analysis.sentiment.toLowerCase().includes('positive')
                          ? 'success'
                          : data.analysis.sentiment.toLowerCase().includes('negative')
                          ? 'error'
                          : 'default'
                      }
                    />
                  </Box>
                ) : (
                  <Typography color="text.secondary">No sentiment analysis available</Typography>
                )}
              </CardContent>
            </Card>

            {data.posts && data.posts.length > 0 ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Reddit Posts ({data.posts.length})
                </Typography>
                <Grid container spacing={3}>
                  {data.posts.map((post: RedditPost) => (
                    <Grid item xs={12} key={post.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <Link
                              href={`https://reddit.com${post.permalink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="inherit"
                              sx={{ 
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {post.title}
                            </Link>
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Posted by {post.author} in r/{post.subreddit} • Score:{' '}
                            {post.score} • Comments: {post.num_comments}
                          </Typography>
                          {post.text && (
                            <Typography
                              variant="body1"
                              sx={{
                                mt: 1,
                                maxHeight: 100,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {post.text}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Typography color="text.secondary">No posts found</Typography>
            )}
          </>
        )}
      </Container>
    </Box>
  );
} 