import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Paper,
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

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

interface Analysis {
  overall_sentiment: string;
  toxicity_level: number;
  frequent_words: string[];
  influential_accounts: string[];
}

interface AnalysisResultProps {
  posts: RedditPost[];
  analysis: Analysis;
  onClose: () => void;
}

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const AnalysisResult: React.FC<AnalysisResultProps> = ({ posts, analysis, onClose }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleExpandClick = (postId: string) => {
    setExpandedId(expandedId === postId ? null : postId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analysis Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              Overall Sentiment:
              <Chip
                label={analysis.overall_sentiment}
                color={getSentimentColor(analysis.overall_sentiment)}
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">
              Toxicity Level:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={analysis.toxicity_level * 100}
                sx={{ flexGrow: 1 }}
                color={analysis.toxicity_level > 0.6 ? 'error' : analysis.toxicity_level > 0.3 ? 'warning' : 'success'}
              />
              <Typography variant="body2">
                {Math.round(analysis.toxicity_level * 100)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Frequent Words:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {analysis.frequent_words.map((word, index) => (
                <Chip key={index} label={word} variant="outlined" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Influential Accounts:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {analysis.influential_accounts.map((account, index) => (
                <Chip key={index} label={account} variant="outlined" color="primary" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Reddit Posts
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div">
                      <Link href={post.url} target="_blank" rel="noopener">
                        {post.title}
                      </Link>
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`r/${post.subreddit}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Score: ${post.score}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Comments: ${post.num_comments}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Posted by u/{post.author} on {formatDate(post.created_utc)}
                    </Typography>
                  </Box>
                  <ExpandMore
                    expand={expandedId === post.id}
                    onClick={() => handleExpandClick(post.id)}
                    aria-expanded={expandedId === post.id}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </Box>
                <Collapse in={expandedId === post.id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {post.text}
                    </Typography>
                    <Link
                      href={`https://reddit.com${post.permalink}`}
                      target="_blank"
                      rel="noopener"
                      sx={{ mt: 1, display: 'block' }}
                    >
                      View on Reddit
                    </Link>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AnalysisResult; 