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
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  History as HistoryIcon,
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
                        <ListItem
                          sx={{
                            cursor: 'pointer',
                            py: 2,
                          }}
                          onClick={() => setSelectedHistory(item)}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHistory(item.id);
                              }}
                              sx={{
                                color: 'error.light',
                                '&:hover': {
                                  color: 'error.main',
                                  bgcolor: 'error.lighter',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SearchIcon fontSize="small" color="primary" />
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {item.topic}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {format(new Date(item.created_at), 'PPpp')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: 'center',
                      bgcolor: 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary" variant="subtitle1">
                      No search history yet
                    </Typography>
                    <Typography color="text.disabled" variant="body2" sx={{ mt: 1 }}>
                      Your search queries will appear here
                    </Typography>
                  </Box>
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
          PaperProps={{
            sx: {
              borderRadius: 2,
              backgroundImage: 'linear-gradient(135deg, rgba(107,141,214,0.03) 0%, rgba(142,55,215,0.03) 100%)',
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Results for: {selectedHistory?.topic}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setSelectedHistory(null)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: 'transparent' }}>
            {selectedHistory && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  {/* Overall Analysis Card */}
                  <Grid item xs={12} md={6}>
                    <Card 
                      elevation={0}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                          Overall Analysis
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
                            sx={{ 
                              mt: 0.5,
                              fontWeight: 'medium',
                              px: 1,
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Toxicity Level
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedHistory.results.analysis.toxicity_level * 100}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: 'grey.100',
                                flex: 1,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: selectedHistory.results.analysis.toxicity_level > 0.7 
                                    ? 'error.main'
                                    : selectedHistory.results.analysis.toxicity_level > 0.3
                                    ? 'warning.main'
                                    : 'success.main',
                                  borderRadius: 5,
                                },
                              }}
                            />
                            <Typography 
                              variant="body2" 
                              fontWeight="medium"
                              sx={{
                                color: selectedHistory.results.analysis.toxicity_level > 0.7 
                                  ? 'error.main'
                                  : selectedHistory.results.analysis.toxicity_level > 0.3
                                  ? 'warning.main'
                                  : 'success.main',
                              }}
                            >
                              {Math.round(selectedHistory.results.analysis.toxicity_level * 100)}%
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Frequent Words Card */}
                  <Grid item xs={12} md={6}>
                    <Card 
                      elevation={0}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
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
                                fontWeight: 'medium',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': { 
                                  bgcolor: 'primary.main',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Influential Accounts Card */}
                  <Grid item xs={12}>
                    <Card 
                      elevation={0}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                          Top Contributors
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedHistory.results.analysis.influential_accounts.map((account, index) => (
                            <Chip
                              key={index}
                              label={account}
                              size="small"
                              sx={{
                                bgcolor: index === 0 ? 'warning.lighter' : 'grey.50',
                                color: index === 0 ? 'warning.darker' : 'text.primary',
                                border: index === 0 ? '1px solid' : 'none',
                                borderColor: 'warning.light',
                                fontWeight: index === 0 ? 'bold' : 'medium',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                },
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Reddit Posts Table */}
                  <Grid item xs={12}>
                    <Card 
                      elevation={0}
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                          Reddit Posts
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Score</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Subreddit</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedHistory.results.posts.map((post) => (
                                <TableRow
                                  key={post.id}
                                  sx={{
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      bgcolor: 'rgba(0, 0, 0, 0.02)',
                                      cursor: 'pointer',
                                    },
                                  }}
                                  onClick={() => window.open(post.permalink, '_blank')}
                                >
                                  <TableCell>
                                    <Tooltip 
                                      title={post.text || 'No additional text'} 
                                      placement="top-start"
                                      arrow
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          maxWidth: '400px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          color: 'primary.main',
                                          fontWeight: 'medium',
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
                                      sx={{ 
                                        fontWeight: 'medium',
                                        minWidth: 60,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight="medium">
                                      {post.num_comments}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`r/${post.subreddit}`}
                                      size="small"
                                      sx={{ 
                                        bgcolor: 'primary.lighter',
                                        color: 'primary.darker',
                                        fontWeight: 'medium',
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {post.author}
                                    </Typography>
                                  </TableCell>
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
          <DialogActions sx={{ p: 2.5 }}>
            <Button 
              onClick={() => setSelectedHistory(null)} 
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                px: 4,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 