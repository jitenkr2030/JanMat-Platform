import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import AdminUser from '../models/AdminUser';
import Poll from '../models/Poll';
import Petition from '../models/Petition';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await AdminUser.deleteMany({});
    await Poll.deleteMany({});
    await Petition.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create default admin user
    const adminUser = new AdminUser({
      username: 'admin',
      email: 'admin@janmat.in',
      password: 'admin123',
      role: 'super_admin',
      permissions: {
        managePolls: true,
        managePetitions: true,
        viewAnalytics: true,
        manageUsers: true,
        systemSettings: true
      }
    });

    await adminUser.save();
    console.log('👤 Created default admin user (admin/admin123)');

    // Sample polls
    const samplePolls = [
      {
        title: "क्या आप सरकार के डिजिटल इंडिया पहल का समर्थन करते हैं?",
        description: "Digital India initiative के बारे में आपकी राय जानना चाहते हैं। क्या आपको लगता है कि यह देश के विकास में मददगार है?",
        type: "yes_no",
        options: [
          { id: "yes", text: "हां, पूरा समर्थन" },
          { id: "no", text: "नहीं, समस्याएं हैं" }
        ],
        category: "national",
        tags: ["digital-india", "technology", "government"],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalVotes: 0,
        createdBy: adminUser._id,
        metadata: {
          priority: "high",
          featured: true
        }
      },
      {
        title: "NEET reforms के बारे में आपकी राय क्या है?",
        description: "NEET (UG) - 2024 reforms पर आपकी विस्तृत राय चाहिए।",
        type: "multiple_choice",
        options: [
          { id: "very-good", text: "बहुत अच्छे reforms हैं" },
          { id: "good", text: "अच्छे reforms हैं" },
          { id: "needs-improvement", text: "मामूली सुधार चाहिए" },
          { id: "not-good", text: "अच्छे नहीं हैं" }
        ],
        category: "social",
        tags: ["neet", "education", "reforms"],
        state: "India",
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        totalVotes: 0,
        createdBy: adminUser._id,
        metadata: {
          priority: "medium",
          featured: true
        }
      },
      {
        title: "Metro cities में odd-even car rule पर आपकी रेटिंग",
        description: "1 से 10 तक, metro cities में odd-even car rule को कितनी बार देंगे?",
        type: "rating",
        options: [
          { id: "1", text: "1 - बहुत खराब" },
          { id: "2", text: "2" },
          { id: "3", text: "3" },
          { id: "4", text: "4" },
          { id: "5", text: "5 - औसत" },
          { id: "6", text: "6" },
          { id: "7", text: "7" },
          { id: "8", text: "8" },
          { id: "9", text: "9" },
          { id: "10", text: "10 - बहुत अच्छा" }
        ],
        category: "local",
        tags: ["transport", "environment", "delhi", "mumbai"],
        city: "Metro Cities",
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalVotes: 0,
        createdBy: adminUser._id,
        metadata: {
          priority: "medium",
          featured: false
        }
      },
      {
        title: "Cashless economy के लिए आपकी reaction",
        description: "Government के cashless economy push पर आपकी reaction कैसी है?",
        type: "emoji",
        options: [
          { id: "😍", text: "😍 बहुत पसंद" },
          { id: "😊", text: "😊 अच्छा है" },
          { id: "😐", text: "😐 ठीक है" },
          { id: "😟", text: "😟 परेशान हूं" },
          { id: "😡", text: "😡 नाराज़ हूं" }
        ],
        category: "economic",
        tags: ["cashless", "economy", "digital-payment"],
        state: "India",
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        totalVotes: 0,
        createdBy: adminUser._id,
        metadata: {
          priority: "low",
          featured: false
        }
      }
    ];

    const createdPolls = await Poll.insertMany(samplePolls);
    console.log(`📊 Created ${createdPolls.length} sample polls`);

    // Sample petitions
    const samplePetitions = [
      {
        title: "Delhi Metro में ladies compartment का विस्तार करें",
        description: "Delhi Metro में ladies compartment की कमी है। विशेषकर peak hours में महिलाओं को काफी परेशानी होती है। कृपया ladies compartment की संख्या बढ़ाई जाए।",
        category: "local",
        state: "Delhi",
        city: "Delhi",
        targetAuthority: "DMRC (Delhi Metro Rail Corporation)",
        createdBy: "user_12345",
        signatures: 156,
        signaturesRequired: 10000,
        status: "active",
        tags: ["delhi-metro", "women-safety", "transport"],
        isUrgent: true,
        supporters: [
          {
            userId: "user_12346",
            signedAt: new Date(),
            message: "बहुत जरूरी मुद्दा है"
          }
        ],
        timeline: [
          {
            event: "Petition Created",
            date: new Date(),
            details: "Petition created by anonymous user"
          }
        ]
      },
      {
        title: "School fee structure में transparency लाने की मांग",
        description: "Private schools में fee structure में काफी अनियमितता है। कई schools में hidden charges लिए जाते हैं। Government को strict guidelines बनाने चाहिए।",
        category: "state",
        state: "Maharashtra",
        city: "Mumbai",
        targetAuthority: "Education Department, Maharashtra",
        createdBy: "user_78901",
        signatures: 342,
        signaturesRequired: 5000,
        status: "active",
        tags: ["education", "fees", "private-schools"],
        isUrgent: false,
        supporters: [],
        timeline: [
          {
            event: "Petition Created",
            date: new Date(),
            details: "Petition created by parent group"
          }
        ]
      },
      {
        title: "National Digital Health Mission का transparent implementation",
        description: "National Digital Health Mission (NDHM) के implementation में transparency और public consent की जरूरत है। Personal health data की security सुनिश्चित करनी चाहिए।",
        category: "national",
        state: "India",
        targetAuthority: "Ministry of Health and Family Welfare",
        createdBy: "user_56789",
        signatures: 789,
        signaturesRequired: 25000,
        status: "active",
        tags: ["digital-health", "privacy", "healthcare"],
        isUrgent: false,
        supporters: [],
        timeline: [
          {
            event: "Petition Created",
            date: new Date(),
            details: "Digital rights activist group"
          }
        ]
      }
    ];

    const createdPetitions = await Petition.insertMany(samplePetitions);
    console.log(`📝 Created ${createdPetitions.length} sample petitions`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n🌐 API Base URL: http://localhost:5000');
    console.log('📊 Health Check: http://localhost:5000/health');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();