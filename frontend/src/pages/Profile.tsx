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
  ListItemText,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

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

  const { data: searchHistory, isLoading } = useQuery<SearchHistoryItem[]>({
    queryKey: ['searchHistory'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/auth/me/history');
      return response.data;
    },
  });

  const handleDeleteHistory = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/auth/me/history/${id}`);
      // Перезагрузить историю после удаления
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 3,
          color: 'text.secondary',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            color: 'primary.main',
          },
        }}
      >
        Back to Search
      </Button>

      <Grid container spacing={4}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={0}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    mb: 2,
                  }}
                >
                  {user?.username.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {user?.username}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Member Since"
                    secondary={format(new Date(user?.created_at || new Date()), 'MMMM d, yyyy')}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Search History Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Search History
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : searchHistory && searchHistory.length > 0 ? (
                <List>
                  {searchHistory.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Button
                            onClick={() => setSelectedHistory(item)}
                            sx={{
                              textAlign: 'left',
                              textTransform: 'none',
                              color: 'text.primary',
                              '&:hover': {
                                bgcolor: 'transparent',
                                color: 'primary.main',
                              },
                            }}
                          >
                            {item.topic}
                          </Button>
                        }
                        secondary={format(new Date(item.created_at), 'PPpp')}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  No search history yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Dialog */}
      <Dialog
        open={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Results for: {selectedHistory?.topic}
          </Typography>
          <IconButton onClick={() => setSelectedHistory(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedHistory && (
            <Box sx={{ mt: 2 }}>
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
                          label={selectedHistory.results.analysis.overall_sentiment}
                          color={
                            selectedHistory.results.analysis.overall_sentiment === 'positive'
                              ? 'success'
                              : selectedHistory.results.analysis.overall_sentiment === 'negative'
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
                            value={selectedHistory.results.analysis.toxicity_level * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.200',
                              flex: 1,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: selectedHistory.results.analysis.toxicity_level > 0.7 
                                  ? 'error.main'
                                  : selectedHistory.results.analysis.toxicity_level > 0.3
                                  ? 'warning.main'
                                  : 'success.main',
                              },
                            }}
                          />
                          <Typography variant="body2">
                            {Math.round(selectedHistory.results.analysis.toxicity_level * 100)}%
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
                        {selectedHistory.results.analysis.frequent_words.map((word, index) => (
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
                        {selectedHistory.results.analysis.influential_accounts.map((account, index) => (
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
                            {selectedHistory.results.posts.map((post) => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedHistory(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 