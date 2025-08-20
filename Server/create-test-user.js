// Script to create a test user for protected routes testing
import mongoose from 'mongoose';
import User from './models/User.js';
import 'dotenv/config';
import { connectDB } from './library/db.js';

async function createTestUser() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to database');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.connection.close();
      return;
    }
    
    // Create a new test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating test user:', error);
    await mongoose.connection.close();
  }
}

createTestUser();