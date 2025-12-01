import express from 'express';
import { query } from 'express-validator';
import Poll from '../models/Poll';
import Vote from '../models/Vote';

const router = express.Router();

// Get poll results with demographic breakdown
router.get('/polls/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const { state, ageGroup, gender } = req.query;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Build filter for votes
    const voteFilter: any = { pollId };
    if (state) voteFilter['metadata.state'] = state;
    if (ageGroup) voteFilter['metadata.ageGroup'] = ageGroup;
    if (gender) voteFilter['metadata.gender'] = gender;

    const votes = await Vote.find(voteFilter);

    // Calculate results
    const results = poll.options.map(option => {
      const optionVotes = votes.filter(vote => vote.selectedOption === option.id);
      const totalOptionVotes = optionVotes.length;
      const percentage = votes.length > 0 ? (totalOptionVotes / votes.length) * 100 : 0;

      return {
        optionId: option.id,
        optionText: option.text,
        votes: totalOptionVotes,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    res.json({
      success: true,
      data: {
        poll: {
          id: poll._id,
          title: poll.title,
          category: poll.category,
          totalVotes: votes.length,
          endDate: poll.endDate
        },
        results,
        filters: { state, ageGroup, gender }
      }
    });

  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results'
    });
  }
});

// Get public sentiment index
router.get('/sentiment', async (req, res) => {
  try {
    const { state, category } = req.query;

    const filter: any = {
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

    if (category) filter.category = category;

    const activePolls = await Poll.find(filter);
    const pollIds = activePolls.map(poll => poll._id);

    const voteFilter: any = { pollId: { $in: pollIds } };
    if (state) voteFilter['metadata.state'] = state;

    const recentVotes = await Vote.find(voteFilter)
      .sort({ createdAt: -1 })
      .limit(1000);

    // Calculate basic sentiment metrics
    const positiveVotes = recentVotes.filter(vote => 
      vote.selectedOption.toLowerCase().includes('yes') ||
      vote.selectedOption.toLowerCase().includes('support') ||
      (vote.rating && vote.rating >= 7)
    ).length;

    const negativeVotes = recentVotes.filter(vote => 
      vote.selectedOption.toLowerCase().includes('no') ||
      vote.selectedOption.toLowerCase().includes('oppose') ||
      (vote.rating && vote.rating <= 3)
    ).length;

    const neutralVotes = recentVotes.length - positiveVotes - negativeVotes;

    const sentimentScore = recentVotes.length > 0 
      ? Math.round(((positiveVotes - negativeVotes) / recentVotes.length) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        sentimentScore,
        breakdown: {
          positive: positiveVotes,
          negative: negativeVotes,
          neutral: neutralVotes
        },
        totalResponses: recentVotes.length,
        filters: { state, category },
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Get sentiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sentiment data'
    });
  }
});

// Get trending topics
router.get('/trending', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    let timeFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1h':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } };
        break;
      case '24h':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    }

    const recentPolls = await Poll.find({
      ...timeFilter,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('title category tags totalVotes')
      .lean();

    res.json({
      success: true,
      data: {
        trendingPolls: recentPolls,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending topics'
    });
  }
});

export default router;