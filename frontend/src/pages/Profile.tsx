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
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

interface SearchHistoryItem {
  id: number;
  topic: string;
  created_at: string;
  results: {
    analysis: {
      summary?: string;
      topics?: string[];
      sentiment?: string;
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
      // TODO: Implement deletion endpoint on backend
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Профиль пользователя */}
        <Card sx={{ flex: '0 0 300px' }} elevation={0}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
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
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText primary="Username" secondary={user?.username} />
              </ListItem>
              <ListItem>
                <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText primary="Email" secondary={user?.email} />
              </ListItem>
              <ListItem>
                <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary="Member Since"
                  secondary={format(new Date(user?.created_at || new Date()), 'MMMM d, yyyy')}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* История поисков */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              pb: 1,
              display: 'inline-block',
            }}
          >
            Search History
          </Typography>

          {isLoading ? (
            <Typography>Loading history...</Typography>
          ) : searchHistory && searchHistory.length > 0 ? (
            <List>
              {searchHistory.map((item) => (
                <Card key={item.id} sx={{ mb: 2 }} elevation={0}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {item.topic}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {format(new Date(item.created_at), 'MMMM d, yyyy HH:mm')}
                        </Typography>
                        {item.results.analysis.topics && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.results.analysis.topics.map((topic, index) => (
                              <Chip
                                key={index}
                                label={topic}
                                size="small"
                                sx={{
                                  bgcolor: 'primary.light',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'primary.main' },
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedHistory(item)}
                          sx={{ color: 'primary.main' }}
                        >
                          <SearchIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteHistory(item.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No search history yet</Typography>
          )}
        </Box>
      </Box>

      {/* Диалог с деталями поиска */}
      <Dialog
        open={!!selectedHistory}
        onClose={() => setSelectedHistory(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Search Details</DialogTitle>
        <DialogContent>
          {selectedHistory && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedHistory.topic}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {format(new Date(selectedHistory.created_at), 'MMMM d, yyyy HH:mm')}
              </Typography>
              
              {selectedHistory.results.analysis.summary && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Summary
                  </Typography>
                  <Typography variant="body2">
                    {selectedHistory.results.analysis.summary}
                  </Typography>
                </Box>
              )}

              {selectedHistory.results.analysis.topics && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Topics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedHistory.results.analysis.topics.map((topic, index) => (
                      <Chip
                        key={index}
                        label={topic}
                        size="small"
                        sx={{
                          bgcolor: 'primary.light',
                          color: 'white',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {selectedHistory.results.analysis.sentiment && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom color="primary">
                    Sentiment
                  </Typography>
                  <Chip
                    label={selectedHistory.results.analysis.sentiment}
                    size="small"
                    sx={{
                      bgcolor: selectedHistory.results.analysis.sentiment.toLowerCase().includes('positive')
                        ? 'success.light'
                        : selectedHistory.results.analysis.sentiment.toLowerCase().includes('negative')
                        ? 'error.light'
                        : 'grey.200',
                      color: selectedHistory.results.analysis.sentiment.toLowerCase().includes('positive')
                        ? 'success.dark'
                        : selectedHistory.results.analysis.sentiment.toLowerCase().includes('negative')
                        ? 'error.dark'
                        : 'text.primary',
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedHistory(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 