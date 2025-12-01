import { Request, Response } from 'express';
import Petition from '../models/Petition';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export class PetitionController {
  static async createPetition(req: Request, res: Response) {
    try {
      const {
        title,
        description,
        category,
        state,
        city,
        targetAuthority,
        tags,
        signaturesRequired = 1000
      } = req.body;

      const { userId } = req.body;

      if (!userId || !title || !description || !category || !targetAuthority) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const petition = new Petition({
        title,
        description,
        category,
        state,
        city,
        targetAuthority,
        createdBy: userId,
        tags: tags || [],
        signaturesRequired,
        status: 'active',
        timeline: [{
          event: 'Petition Created',
          date: new Date(),
          details: `Petition created by anonymous user`
        }]
      });

      await petition.save();

      // Emit real-time event for new petition
      const io = req.app.get('io');
      io?.emit('new-petition', {
        petitionId: petition._id,
        title: petition.title,
        category: petition.category
      });

      res.status(201).json({
        success: true,
        message: 'Petition created successfully',
        data: { petition }
      });

    } catch (error) {
      console.error('Create petition error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create petition'
      });
    }
  }

  static async getPetitions(req: Request, res: Response) {
    try {
      const {
        category,
        state,
        city,
        status = 'active',
        page = 1,
        limit = 10,
        sortBy = '-createdAt'
      } = req.query;

      const filter: any = {};
      
      if (category) filter.category = category;
      if (state) filter.state = state;
      if (city) filter.city = city;
      if (status) filter.status = status;

      const petitions = await Petition.find(filter)
        .sort(sortBy as string)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .select('-supporters') // Don't send supporter details in list
        .lean();

      const total = await Petition.countDocuments(filter);

      // Add computed fields
      const petitionsWithProgress = petitions.map(petition => ({
        ...petition,
        completionPercentage: Math.round((petition.signatures / petition.signaturesRequired) * 100),
        isAchieved: petition.signatures >= petition.signaturesRequired
      }));

      res.json({
        success: true,
        data: {
          petitions: petitionsWithProgress,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });

    } catch (error) {
      console.error('Get petitions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch petitions'
      });
    }
  }

  static async getPetitionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid petition ID'
        });
      }

      const petition = await Petition.findById(id);
      if (!petition) {
        return res.status(404).json({
          success: false,
          message: 'Petition not found'
        });
      }

      // Check if user has signed (for UI purposes)
      let hasSigned = false;
      
      if (userId) {
        hasSigned = petition.supporters.some(supporter => supporter.userId === userId);
      }

      res.json({
        success: true,
        data: {
          petition: {
            ...petition.toObject(),
            completionPercentage: Math.round((petition.signatures / petition.signaturesRequired) * 100),
            isAchieved: petition.signatures >= petition.signaturesRequired
          },
          user: {
            hasSigned
          }
        }
      });

    } catch (error) {
      console.error('Get petition error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch petition'
      });
    }
  }

  static async signPetition(req: Request, res: Response) {
    try {
      const { petitionId } = req.params;
      const { userId, message } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID required'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(petitionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid petition ID'
        });
      }

      const petition = await Petition.findById(petitionId);
      if (!petition) {
        return res.status(404).json({
          success: false,
          message: 'Petition not found'
        });
      }

      if (petition.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Cannot sign this petition - it is not active'
        });
      }

      // Check if user has already signed
      const existingSignature = petition.supporters.find(
        supporter => supporter.userId === userId
      );

      if (existingSignature) {
        return res.status(400).json({
          success: false,
          message: 'You have already signed this petition'
        });
      }

      // Add signature
      petition.supporters.push({
        userId,
        signedAt: new Date(),
        message: message || undefined
      });

      petition.signatures += 1;

      // Update timeline
      petition.timeline.push({
        event: 'New Signature',
        date: new Date(),
        details: `Total signatures reached: ${petition.signatures}`
      });

      await petition.save();

      // Emit real-time event
      const io = req.app.get('io');
      io?.emit('petition-signed', {
        petitionId: petition._id,
        newSignatureCount: petition.signatures,
        isAchieved: petition.signatures >= petition.signaturesRequired
      });

      res.json({
        success: true,
        message: 'Petition signed successfully',
        data: {
          petition: {
            id: petition._id,
            signatures: petition.signatures,
            completionPercentage: Math.round((petition.signatures / petition.signaturesRequired) * 100),
            isAchieved: petition.signatures >= petition.signaturesRequired
          }
        }
      });

    } catch (error) {
      console.error('Sign petition error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sign petition'
      });
    }
  }

  static async getUrgentPetitions(req: Request, res: Response) {
    try {
      const urgentPetitions = await Petition.find({
        isUrgent: true,
        status: 'active'
      })
        .sort({ signatures: -1 })
        .limit(20)
        .lean();

      const petitionsWithProgress = urgentPetitions.map(petition => ({
        ...petition,
        completionPercentage: Math.round((petition.signatures / petition.signaturesRequired) * 100),
        isAchieved: petition.signatures >= petition.signaturesRequired
      }));

      res.json({
        success: true,
        data: { petitions: petitionsWithProgress }
      });

    } catch (error) {
      console.error('Get urgent petitions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch urgent petitions'
      });
    }
  }

  static async searchPetitions(req: Request, res: Response) {
    try {
      const { q, tags, category, state } = req.query;
      const { page = 1, limit = 10 } = req.query;

      const filter: any = { status: 'active' };

      // Text search
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ];
      }

      // Tags search
      if (tags) {
        const tagArray = (tags as string).split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
      }

      // Category filter
      if (category) filter.category = category;

      // State filter
      if (state) filter.state = state;

      const petitions = await Petition.find(filter)
        .sort({ signatures: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean();

      const total = await Petition.countDocuments(filter);

      const petitionsWithProgress = petitions.map(petition => ({
        ...petition,
        completionPercentage: Math.round((petition.signatures / petition.signaturesRequired) * 100),
        isAchieved: petition.signatures >= petition.signaturesRequired
      }));

      res.json({
        success: true,
        data: {
          petitions: petitionsWithProgress,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });

    } catch (error) {
      console.error('Search petitions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search petitions'
      });
    }
  }

  static async updatePetitionStatus(req: Request & { admin?: any }, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid petition ID'
        });
      }

      const petition = await Petition.findByIdAndUpdate(
        id,
        {
          status,
          adminNotes,
          updatedAt: new Date(),
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
        message: 'Petition status updated successfully',
        data: { petition }
      });

    } catch (error) {
      console.error('Update petition status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update petition status'
      });
    }
  }
}