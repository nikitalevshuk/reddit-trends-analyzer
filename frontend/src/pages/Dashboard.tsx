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
  CircularProgress,
  Chip,
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
import {
  Person,
  Reddit as RedditIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
  const { user } = useAuth();
  const [searchTopic, setSearchTopic] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);

  const queryOptions = {
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
  };

  const { data, isLoading } = useQuery<SearchResponse, Error>(queryOptions);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEnabled(true);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
        {/* Header with auth button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          {user ? (
            <Button
              component={RouterLink}
              to="/profile"
              startIcon={<Person />}
              sx={{ 
                color: 'text.secondary',
                bgcolor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: 'white',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {user.username}
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              sx={{ 
                color: 'text.secondary',
                bgcolor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: 'white',
                  color: 'primary.main',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Sign In
            </Button>
          )}
        </Box>

        {/* Main content */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 8,
          }}
        >
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Reddit Topic Analyzer
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            color="text.secondary"
            sx={{ 
              maxWidth: 600, 
              mb: 4,
              fontWeight: 'normal',
            }}
          >
            Discover insights from Reddit discussions with advanced AI analysis
          </Typography>

          {/* Search Form */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              width: '100%',
              maxWidth: 600,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <form onSubmit={handleSearch}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="Enter a topic to analyze..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'grey.50',
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    px: 4,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Feature cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <RedditIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'primary.main',
                    mb: 2,
                  }} 
                />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Reddit Data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access real-time discussions and posts from Reddit's vast community
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PsychologyIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'success.main',
                    mb: 2,
                  }} 
                />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  AI Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced AI-powered analysis of sentiment and key topics
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AnalyticsIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'warning.main',
                    mb: 2,
                  }} 
                />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Deep Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Discover trends, patterns, and influential contributors
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SecurityIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: 'error.main',
                    mb: 2,
                  }} 
                />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your searches and analysis results are protected
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Analysis Results */}
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
      </Container>
    </Box>
  );
} 