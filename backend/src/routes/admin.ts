import express from 'express';
import { body, query } from 'express-validator';
import Petition from '../models/Petition';
import Vote from '../models/Vote';
import Poll from '../models/Poll';

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Basic stats
    const [totalPolls, activePolls, totalVotes, totalPetitions] = await Promise.all([
      Poll.countDocuments(),
      Poll.countDocuments({ isActive: true }),
      Vote.countDocuments(),
      Petition.countDocuments()
    ]);

    // Recent activity
    const [recentPolls, recentVotes, recentPetitions] = await Promise.all([
      Poll.countDocuments({ createdAt: { $gte: last24h } }),
      Vote.countDocuments({ createdAt: { $gte: last24h } }),
      Petition.countDocuments({ createdAt: { $gte: last24h } })
    ]);

    // Category breakdown
    const categoryStats = await Poll.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalVotes: { $sum: '$totalVotes' }
        }
      }
    ]);

    // State-wise activity
    const stateStats = await Vote.aggregate([
      {
        $group: {
          _id: '$metadata.state',
          votes: { $sum: 1 }
        }
      },
      { $sort: { votes: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalPolls,
          activePolls,
          totalVotes,
          totalPetitions,
          recentActivity: {
            polls: recentPolls,
            votes: recentVotes,
            petitions: recentPetitions
          }
        },
        categoryBreakdown: categoryStats,
        topStates: stateStats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = '7d', category } = req.query;

    let timeFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1d':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        timeFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    }

    const pollFilter: any = { ...timeFilter };
    if (category) pollFilter.category = category;

    // Daily vote activity
    const dailyVotes = await Vote.aggregate([
      { $match: timeFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          votes: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category performance
    const categoryPerformance = await Poll.aggregate([
      { $match: pollFilter },
      {
        $group: {
          _id: '$category',
          pollCount: { $sum: 1 },
          avgVotes: { $avg: '$totalVotes' },
          totalVotes: { $sum: '$totalVotes' }
        }
      },
      { $sort: { totalVotes: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        dailyVotes,
        categoryPerformance,
        timeframe
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Manage petitions (admin only)
router.patch('/petitions/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['active', 'submitted', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const petition = await Petition.findByIdAndUpdate(
      id,
      {
        status,
        adminNotes,
        $push: {
          timeline: {
            event: 'Status Updated',
            date: new Date(),
            details: `Status changed to ${status} by admin`
          }
        }
      },
      { new: true }
    );

    if (!petition) {
      return res.status(404).json({
        success: false,
        message: 'Petition not found'
      });
    }

    res.json({
      success: true,
      message: 'Petition status updated',
      data: { petition }
    });

  } catch (error) {
    console.error('Update petition status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update petition status'
    });
  }
});

// System health check
router.get('/health', async (req, res) => {
  try {
    const [polls, votes, petitions] = await Promise.all([
      Poll.countDocuments(),
      Vote.countDocuments(),
      Petition.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        system: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date()
        },
        database: {
          polls,
          votes,
          petitions,
          totalRecords: polls + votes + petitions
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed'
    });
  }
});

export default router;