import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import api from '../config/api';

interface SearchHistoryItem {
  id: number;
  topic: string;
  created_at: string;
  results: {
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
  };
}

export default function Profile() {
  const { user } = useAuth();
  const [selectedHistory, setSelectedHistory] = useState<SearchHistoryItem | null>(null);
  const queryClient = useQueryClient();

  const { data: searchHistory, isLoading, error } = useQuery({
    queryKey: ['searchHistory'] as const,
    queryFn: async () => {
      const response = await api.get<SearchHistoryItem[]>('/api/auth/me/history');
      return response.data;
    },
  });

  const handleDeleteHistory = async (id: number) => {
    try {
      await api.delete(`/api/auth/me/history/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['searchHistory'] as const });
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const handleViewResults = (item: SearchHistoryItem) => {
    setSelectedHistory(item);
  };

  const handleCloseResults = () => {
    setSelectedHistory(null);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        pt: 4,
        pb: 8
      }}
    >
      <Container maxWidth="lg">
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{
            mb: 4,
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
          Back to Search
        </Button>

        <Grid container spacing={4}>
          {/* User Info Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: 'linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)',
                  borderRadius: '8px 8px 0 0',
                },
              }}
            >
              <CardContent sx={{ position: 'relative', pt: 7 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontSize: '2.5rem',
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      mb: 2,
                    }}
                  >
                    {user?.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {user?.username}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        width: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="primary" />
                        {user?.email}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(0,0,0,0.02)',
                        borderRadius: 1,
                        width: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Member Since
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" color="primary" />
                        {format(new Date(user?.created_at || new Date()), 'MMMM d, yyyy')}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Search History Card */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={0}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <HistoryIcon color="primary" />
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    Search History
                  </Typography>
                </Box>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" align="center">
                    Error loading search history
                  </Typography>
                ) : searchHistory && searchHistory.length > 0 ? (
                  <List sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                    {searchHistory.map((item) => (
                      <Paper
                        key={item.id}
                        elevation={0}
                        sx={{
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(0, 0, 0, 0.01)',
                          },
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="div">
                              {item.topic}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => handleViewResults(item)}
                                sx={{ mr: 1 }}
                              >
                                <SearchIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteHistory(item.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(item.created_at), 'PPpp')}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={`${item.results.posts.length} posts`}
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              size="small"
                              label={item.results.analysis.overall_sentiment}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography align="center" color="text.secondary">
                    No search history yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Results Dialog */}
      <Dialog
        open={!!selectedHistory}
        onClose={handleCloseResults}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Search Results: {selectedHistory?.topic}
            </Typography>
            <IconButton onClick={handleCloseResults}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedHistory && (
            <>
              {/* Analysis Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Analysis</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Overall Sentiment</Typography>
                      <Typography variant="h6" color="primary">
                        {selectedHistory.results.analysis.overall_sentiment}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Toxicity Level</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={selectedHistory.results.analysis.toxicity_level * 100}
                          sx={{ flexGrow: 1, mr: 2 }}
                        />
                        <Typography variant="body2">
                          {Math.round(selectedHistory.results.analysis.toxicity_level * 100)}%
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Posts Section */}
              <Typography variant="h6" gutterBottom>Posts</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Subreddit</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Comments</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedHistory.results.posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>{post.title}</TableCell>
                        <TableCell>r/{post.subreddit}</TableCell>
                        <TableCell>{post.score}</TableCell>
                        <TableCell>{post.num_comments}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on Reddit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
} 