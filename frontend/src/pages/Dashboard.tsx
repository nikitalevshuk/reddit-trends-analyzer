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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
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
  posts: Array<{
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
  }>;
  analysis: {
    overall_sentiment: string;
    toxicity_level: number;
    frequent_words: string[];
    influential_accounts: string[];
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
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={3}>
                {/* Overall Analysis Card */}
                <Grid item xs={12} md={6}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Overall Analysis
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Sentiment
                        </Typography>
                        <Chip
                          label={data.analysis.overall_sentiment}
                          color={
                            data.analysis.overall_sentiment === 'positive'
                              ? 'success'
                              : data.analysis.overall_sentiment === 'negative'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Toxicity Level
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={data.analysis.toxicity_level * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              flex: 1,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: data.analysis.toxicity_level > 0.7 
                                  ? 'error.main'
                                  : data.analysis.toxicity_level > 0.3
                                  ? 'warning.main'
                                  : 'success.main',
                              },
                            }}
                          />
                          <Typography variant="body2">
                            {Math.round(data.analysis.toxicity_level * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Frequent Words Card */}
                <Grid item xs={12} md={6}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Frequent Words
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {data.analysis.frequent_words.map((word, index) => (
                          <Chip
                            key={index}
                            label={word}
                            size="small"
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'white',
                              '&:hover': { bgcolor: 'primary.main' },
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Influential Accounts Card */}
                <Grid item xs={12}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Top Contributors
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {data.analysis.influential_accounts.map((account, index) => (
                          <Chip
                            key={index}
                            label={account}
                            size="small"
                            sx={{
                              bgcolor: index === 0 ? 'warning.light' : 'grey.100',
                              color: index === 0 ? 'warning.dark' : 'text.primary',
                              border: index === 0 ? '1px solid' : 'none',
                              borderColor: 'warning.main',
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Reddit Posts Table */}
                <Grid item xs={12}>
                  <Card elevation={0}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Reddit Posts
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Title</TableCell>
                              <TableCell align="right">Score</TableCell>
                              <TableCell align="right">Comments</TableCell>
                              <TableCell>Subreddit</TableCell>
                              <TableCell>Author</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {data.posts.map((post) => (
                              <TableRow
                                key={post.id}
                                sx={{
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                    cursor: 'pointer',
                                  },
                                }}
                                onClick={() => window.open(post.permalink, '_blank')}
                              >
                                <TableCell>
                                  <Tooltip title={post.text} placement="top-start">
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        maxWidth: '400px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {post.title}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={post.score}
                                    size="small"
                                    color={post.score > 1000 ? 'primary' : 'default'}
                                  />
                                </TableCell>
                                <TableCell align="right">{post.num_comments}</TableCell>
                                <TableCell>r/{post.subreddit}</TableCell>
                                <TableCell>{post.author}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
} 