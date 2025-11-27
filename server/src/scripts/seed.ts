import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Investment } from '../models/Investment';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Investment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);

    const admin = await User.create({
      email: 'admin@altfolio.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash: adminPassword,
    });

    const viewer = await User.create({
      email: 'viewer@altfolio.com',
      name: 'Viewer User',
      role: 'viewer',
      passwordHash: viewerPassword,
    });

    console.log('Created users');

    // Create sample investments
    const investments = [
      {
        assetName: 'TechStart Inc.',
        assetType: 'Startup',
        investedAmount: 50000,
        investmentDate: new Date('2023-01-15'),
        currentValue: 75000,
        owners: [admin._id],
      },
      {
        assetName: 'Crypto Growth Fund',
        assetType: 'Crypto Fund',
        investedAmount: 25000,
        investmentDate: new Date('2023-03-20'),
        currentValue: 22000,
        owners: [admin._id, viewer._id],
      },
      {
        assetName: 'Organic Farm Co.',
        assetType: 'Farmland',
        investedAmount: 100000,
        investmentDate: new Date('2023-06-10'),
        currentValue: 110000,
        owners: [admin._id],
      },
      {
        assetName: 'Vintage Art Collection',
        assetType: 'Collectible',
        investedAmount: 15000,
        investmentDate: new Date('2023-08-05'),
        currentValue: 18000,
        owners: [viewer._id],
      },
    ];

    await Investment.insertMany(investments);
    console.log('Created sample investments');

    console.log('\n=== Seed Data Complete ===');
    console.log('Admin Login: admin@altfolio.com / admin123');
    console.log('Viewer Login: viewer@altfolio.com / viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();