import { Request, Response } from 'express';
import Vote from '../models/Vote';
import Poll from '../models/Poll';
import { v4 as uuidv4 } from 'uuid';

export class VoteController {
  static async castVote(req: Request, res: Response) {
    try {
      const { userId, pollId, selectedOption, rating, emoji } = req.body;

      // Validate required fields
      if (!userId || !pollId || !selectedOption) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, pollId, selectedOption'
        });
      }

      // Check if poll exists and is active
      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      if (!poll.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Poll is not active'
        });
      }

      // Check if poll has ended
      if (new Date() > poll.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Poll has ended'
        });
      }

      // Validate that the selected option exists in the poll
      const validOption = poll.options.find(option => option.id === selectedOption);
      if (!validOption) {
        return res.status(400).json({
          success: false,
          message: 'Invalid option selected'
        });
      }

      // Check if user has already voted
      const existingVote = await Vote.findOne({ userId, pollId });
      if (existingVote) {
        return res.status(400).json({
          success: false,
          message: 'You have already voted in this poll'
        });
      }

      // Create vote
      const vote = new Vote({
        userId,
        pollId,
        selectedOption,
        rating,
        emoji,
        metadata: {
          state: req.body.state,
          city: req.body.city,
          ageGroup: req.body.ageGroup,
          gender: req.body.gender,
          timestamp: new Date()
        }
      });

      await vote.save();

      // Update poll's total votes
      poll.totalVotes += 1;
      await poll.save();

      // Emit real-time vote event
      const io = req.app.get('io');
      io?.to(`poll-${pollId}`).emit('new-vote', {
        pollId,
        selectedOption,
        totalVotes: poll.totalVotes
      });

      res.status(201).json({
        success: true,
        message: 'Vote cast successfully',
        data: {
          vote: {
            id: vote._id,
            pollId: vote.pollId,
            selectedOption: vote.selectedOption,
            timestamp: vote.createdAt
          }
        }
      });

    } catch (error) {
      console.error('Cast vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cast vote'
      });
    }
  }

  static async getUserVotes(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const votes = await Vote.find({ userId })
        .populate('pollId', 'title category endDate')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      const total = await Vote.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          votes,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get user votes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user votes'
      });
    }
  }

  static async getPollVotes(req: Request, res: Response) {
    try {
      const { pollId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Check if poll exists
      const pollExists = await Poll.findById(pollId);
      if (!pollExists) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      const votes = await Vote.find({ pollId })
        .select('metadata timestamp')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      const total = await Vote.countDocuments({ pollId });

      res.json({
        success: true,
        data: {
          votes,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get poll votes error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch poll votes'
      });
    }
  }

  static async updateVote(req: Request, res: Response) {
    try {
      const { voteId } = req.params;
      const { selectedOption, rating, emoji } = req.body;

      const vote = await Vote.findById(voteId);
      if (!vote) {
        return res.status(404).json({
          success: false,
          message: 'Vote not found'
        });
      }

      // Check if poll is still active
      const poll = await Poll.findById(vote.pollId);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Associated poll not found'
        });
      }

      if (!poll.isActive || new Date() > poll.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update vote - poll is closed'
        });
      }

      // Update vote
      vote.selectedOption = selectedOption || vote.selectedOption;
      vote.rating = rating;
      vote.emoji = emoji;
      await vote.save();

      // Emit real-time update event
      const io = req.app.get('io');
      io?.to(`poll-${vote.pollId}`).emit('vote-updated', {
        pollId: vote.pollId,
        voteId: vote._id,
        selectedOption: vote.selectedOption
      });

      res.json({
        success: true,
        message: 'Vote updated successfully',
        data: { vote }
      });

    } catch (error) {
      console.error('Update vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update vote'
      });
    }
  }

  static async deleteVote(req: Request, res: Response) {
    try {
      const { voteId } = req.params;

      const vote = await Vote.findById(voteId);
      if (!vote) {
        return res.status(404).json({
          success: false,
          message: 'Vote not found'
        });
      }

      // Check if poll is still active
      const poll = await Poll.findById(vote.pollId);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Associated poll not found'
        });
      }

      if (!poll.isActive || new Date() > poll.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete vote - poll is closed'
        });
      }

      // Delete vote and update poll count
      await Vote.findByIdAndDelete(voteId);
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
      await poll.save();

      // Emit real-time delete event
      const io = req.app.get('io');
      io?.to(`poll-${vote.pollId}`).emit('vote-deleted', {
        pollId: vote.pollId,
        totalVotes: poll.totalVotes
      });

      res.json({
        success: true,
        message: 'Vote deleted successfully'
      });

    } catch (error) {
      console.error('Delete vote error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete vote'
      });
    }
  }

  static async getVoteAnalytics(req: Request, res: Response) {
    try {
      const { pollId } = req.params;

      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({
          success: false,
          message: 'Poll not found'
        });
      }

      const totalVotes = await Vote.countDocuments({ pollId });

      // Get demographic breakdown
      const demographicBreakdown = await Vote.aggregate([
        { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
        {
          $group: {
            _id: {
              state: '$metadata.state',
              ageGroup: '$metadata.ageGroup',
              gender: '$metadata.gender'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get option breakdown
      const optionBreakdown = await Vote.aggregate([
        { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
        {
          $group: {
            _id: '$selectedOption',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalVotes,
          demographicBreakdown,
          optionBreakdown
        }
      });

    } catch (error) {
      console.error('Get vote analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vote analytics'
      });
    }
  }
}