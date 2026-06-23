// CommonJS seed script - avoids ES module import hoisting issues
const dns = require('dns');
const fs = require('fs');
const path = require('path');

// Fix DNS SRV resolution on Windows
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .reduce((acc, line) => {
    const match = line.match(/^([^=\s]+)=(.*)$/);
    if (match) acc[match[1].trim()] = match[2].trim();
    return acc;
  }, {});

process.env = { ...process.env, ...envConfig };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (inline to avoid import issues)
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGODB_URI = "mongodb+srv://couponchy:oR3P6cWjIQ14DZTn@cluster0.t4goi1t.mongodb.net/couponchy?retryWrites=true&w=majority";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
    console.log('Connected to MongoDB Atlas!');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('Seeding admin:', adminEmail);

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await new User({ email: adminEmail, password: hashedPassword, role: 'admin' }).save();
    console.log('Admin user created successfully!');

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
