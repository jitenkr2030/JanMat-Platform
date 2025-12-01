import { Request, Response } from 'express';
import Poll from '../models/Poll';
import Vote from '../models/Vote';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

export class PollController {
  static async createPoll(req: Request & { admin?: any }, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const pollData = {
        ...req.body,
        createdBy: req.admin!._id
      };

      const poll = new Poll(pollData);
      await poll.save();

      // Emit real-time event for new poll
      const io = req.app.get('io');
      io?.emit('new-poll', {
        pollId: poll._id,
        title: poll.title,
        category: poll.category
      });

      res.status(201).json({
        success: true,
        message: 'Poll created successfully',
        data: { poll }
      });

    } catch (error) {
      console.error('Create poll error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create poll'
      });
    }
  }

  static async getPolls(req: Request, res: Response) {
    try {
      const {
        category,
        state,
        isActive = 'true',
        page = 1,
        limit = 10,
        sortBy = '-createdAt'
      } = req.query;

      const filter: any = {};
      
      if (category) filter.category = category;
      if (state) filter.state = state;
      if (isActive === 'true') filter.isActive = true;

      const polls = await Poll.find(filter)
        .sort(sortBy as string)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .select('-results') // Don't send results in list view
        .lean();

      const total = await Poll.countDocuments(filter);

      res.json({
        success: true,
        data: {
          polls,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get polls error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch polls'
      });
    }
  }

  static async getPollById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid poll ID'
        });
      }

      const poll = await Poll.findById(id);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      // Check if user has already voted (for UI purposes)
      const userId = req.query.userId as string;
      let hasVoted = false;
      
      if (userId) {
        const existingVote = await Vote.findOne({
          userId,
          pollId: poll._id
        });
        hasVoted = !!existingVote;
      }

      res.json({
        success: true,
        data: {
          poll,
          user: {
            hasVoted
          }
        }
      });

    } catch (error) {
      console.error('Get poll error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch poll'
      });
    }
  }

  static async updatePoll(req: Request & { admin?: any }, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid poll ID'
        });
      }

      const poll = await Poll.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      // Emit real-time event for poll update
      const io = req.app.get('io');
      io?.emit('poll-updated', {
        pollId: poll._id,
        title: poll.title,
        isActive: poll.isActive
      });

      res.json({
        success: true,
        message: 'Poll updated successfully',
        data: { poll }
      });

    } catch (error) {
      console.error('Update poll error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update poll'
      });
    }
  }

  static async deletePoll(req: Request & { admin?: any }, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid poll ID'
        });
      }

      // Delete all votes for this poll first
      await Vote.deleteMany({ pollId: id });

      const poll = await Poll.findByIdAndDelete(id);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      // Emit real-time event for poll deletion
      const io = req.app.get('io');
      io?.emit('poll-deleted', { pollId: id });

      res.json({
        success: true,
        message: 'Poll deleted successfully'
      });

    } catch (error) {
      console.error('Delete poll error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete poll'
      });
    }
  }

  static async getActivePolls(req: Request, res: Response) {
    try {
      const now = new Date();
      
      const polls = await Poll.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
        .sort({ 'metadata.featured': -1, createdAt: -1 })
        .limit(10)
        .lean();

      res.json({
        success: true,
        data: { polls }
      });

    } catch (error) {
      console.error('Get active polls error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active polls'
      });
    }
  }

  static async getPollResults(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { state, ageGroup, gender } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid poll ID'
        });
      }

      const poll = await Poll.findById(id);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      // Build filter for votes
      const voteFilter: any = { pollId: id };
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

      // Calculate demographic breakdowns
      const demographicBreakdown = {
        state: {} as any,
        ageGroup: {} as any,
        gender: {} as any
      };

      // State breakdown
      const stateGroups = votes.reduce((acc, vote) => {
        const state = vote.metadata.state || 'Unknown';
        if (!acc[state]) acc[state] = {};
        
        const option = acc[state][vote.selectedOption] || 0;
        acc[state][vote.selectedOption] = option + 1;
        
        return acc;
      }, {} as any);

      demographicBreakdown.state = stateGroups;

      res.json({
        success: true,
        data: {
          poll: {
            id: poll._id,
            title: poll.title,
            totalVotes: votes.length
          },
          results,
          demographicBreakdown
        }
      });

    } catch (error) {
      console.error('Get poll results error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch poll results'
      });
    }
  }
}