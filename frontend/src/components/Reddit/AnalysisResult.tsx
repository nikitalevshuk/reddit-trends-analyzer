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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

interface AnalysisResultProps {
  posts: RedditPost[];
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

const AnalysisResult: React.FC<AnalysisResultProps> = ({ posts }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const handleExpandClick = (postId: string) => {
    setExpandedId(expandedId === postId ? null : postId);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Search Results
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
                      href={post.permalink}
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