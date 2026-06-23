// This is a plain JS script so we enforce env string loading
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Fix for Node.js DNS resolution issues on some Windows setups
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) acc[match[1]] = match[2];
    return acc;
  }, {});

process.env = { ...process.env, ...envConfig };

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

// Force direct shard connection to bypass SRV DNS issues
const MONGODB_URI = "mongodb://couponchy:oR3P6cWjIQ14DZTn@ac-qm4snh1-shard-00-00.t4goi1t.mongodb.net:27017,ac-qm4snh1-shard-00-01.t4goi1t.mongodb.net:27017,ac-qm4snh1-shard-00-02.t4goi1t.mongodb.net:27017/couponchy?ssl=true&replicaSet=atlas-qm4snh-shard-0&authSource=admin";

async function seedAdmin() {
  try {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4
    };
    await mongoose.connect(MONGODB_URI, opts);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env.local');
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user seeded successfully!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
