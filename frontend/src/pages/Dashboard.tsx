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
  Paper,
} from '@mui/material';
import { LogoutOutlined, SearchOutlined, PersonOutline, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, UseQueryOptions, QueryObserverSuccessCallback } from '@tanstack/react-query';
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

  const queryOptions: UseQueryOptions<SearchResponse, Error, SearchResponse> & {
    onSuccess?: QueryObserverSuccessCallback<SearchResponse>
  } = {
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
    retry: false,
    onSuccess: (data: SearchResponse) => {
      console.log('Response received:', data);
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
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography 
            variant="h5" 
            component={RouterLink}
            to="/"
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'none',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            Reddit Topic Analyzer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Button
                  component={RouterLink}
                  to="/profile"
                  startIcon={<Person />}
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  {user.username}
                </Button>
                <IconButton 
                  onClick={handleLogout}
                  size="small"
                  sx={{ 
                    bgcolor: '#f0f2f5',
                    '&:hover': { bgcolor: '#e3e5e8' }
                  }}
                >
                  <LogoutOutlined fontSize="small" />
                </IconButton>
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                startIcon={<PersonOutline />}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box
          sx={{
            mt: !data ? 15 : 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {!data && (
            <>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  mb: 2,
                  fontWeight: 'bold',
                  maxWidth: 600,
                  color: 'text.primary',
                }}
              >
                Analyze Any Topic on Reddit with AI
              </Typography>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{
                  mb: 4,
                  maxWidth: 600,
                  color: 'text.secondary',
                }}
              >
                Enter any topic and get instant AI-powered analysis of Reddit discussions
              </Typography>
            </>
          )}

          <Paper
            component="form"
            onSubmit={handleSearch}
            elevation={2}
            sx={{
              p: 2,
              width: '100%',
              maxWidth: 600,
              display: 'flex',
              gap: 2,
              mb: 4,
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter a topic to analyze..."
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: '1.1rem' }
              }}
            />
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <SearchOutlined sx={{ mr: 1 }} />
                  Search
                </>
              )}
            </Button>
          </Paper>

          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mt: 2, 
                bgcolor: '#fff3f3', 
                p: 2, 
                borderRadius: 1,
                width: '100%',
                maxWidth: 600,
                textAlign: 'center'
              }}
            >
              Error: {error.message || 'Failed to fetch results'}
            </Typography>
          )}

          {data && (
            <Box sx={{ width: '100%' }}>
              <Card sx={{ mb: 4 }} elevation={0}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                      display: 'inline-block'
                    }}
                  >
                    Analysis Results
                  </Typography>

                  {data.analysis?.summary ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                        Summary
                      </Typography>
                      <Typography 
                        paragraph 
                        sx={{ 
                          bgcolor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {data.analysis.summary}
                      </Typography>
                    </Box>
                  ) : null}

                  {data.analysis?.topics && data.analysis.topics.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                        Key Topics
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {data.analysis.topics.map((topic: string, index: number) => (
                          <Chip
                            key={index}
                            label={topic}
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.main' }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {data.analysis?.sentiment && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                        Overall Sentiment
                      </Typography>
                      <Chip
                        label={data.analysis.sentiment}
                        sx={{
                          bgcolor: data.analysis.sentiment.toLowerCase().includes('positive')
                            ? 'success.light'
                            : data.analysis.sentiment.toLowerCase().includes('negative')
                            ? 'error.light'
                            : 'grey.200',
                          color: data.analysis.sentiment.toLowerCase().includes('positive')
                            ? 'success.dark'
                            : data.analysis.sentiment.toLowerCase().includes('negative')
                            ? 'error.dark'
                            : 'text.primary',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>

              {data.posts && data.posts.length > 0 && (
                <>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      borderBottom: '2px solid',
                      borderColor: 'primary.main',
                      pb: 1,
                      display: 'inline-block',
                      mb: 3
                    }}
                  >
                    Reddit Posts ({data.posts.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {data.posts.map((post: RedditPost) => (
                      <Grid item xs={12} key={post.id}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: '#f8f9fa',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              <Link
                                href={`https://reddit.com${post.permalink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ 
                                  color: 'text.primary',
                                  textDecoration: 'none',
                                  '&:hover': { 
                                    color: 'primary.main',
                                    textDecoration: 'none'
                                  }
                                }}
                              >
                                {post.title}
                              </Link>
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                              sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                            >
                              <span>Posted by {post.author}</span>
                              <span>•</span>
                              <span>r/{post.subreddit}</span>
                              <span>•</span>
                              <span>Score: {post.score}</span>
                              <span>•</span>
                              <span>Comments: {post.num_comments}</span>
                            </Typography>
                            {post.text && (
                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: 'text.secondary',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
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
              )}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
} 