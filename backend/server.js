import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Use environment variable for MongoDB URI

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  trustProxy: true
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // limit API calls
  message: 'Too many API requests'
});

app.use(limiter);
app.use('/api/', apiLimiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.disable('x-powered-by');


// MongoDB connection with security
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});


// Define Waitlist Schema
const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  timestamp: {
    type: Number,
    default: () => Date.now()
  },
  verified: {
    type: Boolean,
    default: true
  }
}, {
  collection: 'waitlist'  // Collection name in MongoDB
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);


// // ✅ Updated: Email verification endpoint with /api prefix
// app.post('/api/verify-email', (req, res) => {
//   const { email } = req.body;
  
//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       error: 'Email is required'
//     });
//   }
  
//   const pythonScript = path.join(__dirname, 'email-check.py');
//   const pythonProcess = spawn('python3', ['-u', pythonScript, email]);
  
//   let result = '';
//   let error = '';

//   pythonProcess.stdout.on('data', (data) => {
//     result += data.toString();
//   });

//   pythonProcess.stderr.on('data', (data) => {
//     error += data.toString();
//   });

//   pythonProcess.on('close', (code) => {
//     if (code !== 0) {
//       return res.status(500).json({ 
//         success: false, 
//         error: `Python script failed: ${error}` 
//       });
//     }
    
//     try {
//       const parsedResult = JSON.parse(result.trim());
//       res.json(parsedResult);
//     } catch (e) {
//       res.status(500).json({ 
//         success: false, 
//         error: 'Failed to parse result' 
//       });
//     }
//   });
// });



// Enhanced /api/verify-email endpoint with detailed logging
app.post('/api/verify-email', (req, res) => {
  const startTime = Date.now();
  console.log('🔍 /api/verify-email endpoint called at', new Date().toISOString());
  console.log('📧 Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('🌐 Request IP:', req.ip);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  const { email } = req.body;
  console.log('📧 Extracted email:', email);
  
  if (!email) {
    console.error('❌ Email validation failed: Email is missing in request body');
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('❌ Email validation failed: Invalid email format for', email);
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  console.log('✅ Email format validation passed for:', email);
  
  const pythonScript = path.join(__dirname, 'email-check.py');
  console.log('📁 Python script path:', pythonScript);
  console.log('📁 Current working directory:', process.cwd());
  console.log('📁 __dirname:', __dirname);
  
  // Check if Python script exists
  const fs = require('fs');
  if (!fs.existsSync(pythonScript)) {
    console.error('❌ Python script not found at:', pythonScript);
    return res.status(500).json({
      success: false,
      error: 'Email verification service unavailable'
    });
  }
  
  console.log('✅ Python script found, spawning process...');
  console.log('🐍 Command: python3 -u', pythonScript, email);
  
  const pythonProcess = spawn('python3', ['-u', pythonScript, email], {
    cwd: __dirname,
    env: process.env
  });
  
  let result = '';
  let error = '';
  let hasResponded = false;
  
  // Set timeout for the Python process
  const timeout = setTimeout(() => {
    if (!hasResponded) {
      console.error('⏰ Python script timeout after 30 seconds');
      pythonProcess.kill('SIGTERM');
      hasResponded = true;
      res.status(500).json({
        success: false,
        error: 'Email verification timed out'
      });
    }
  }, 30000); // 30 seconds timeout

  pythonProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('🐍 Python stdout chunk:', output);
    result += output;
  });

  pythonProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.error('🐍 Python stderr chunk:', errorOutput);
    error += errorOutput;
  });

  pythonProcess.on('error', (err) => {
    console.error('❌ Python process error:', err);
    clearTimeout(timeout);
    if (!hasResponded) {
      hasResponded = true;
      res.status(500).json({
        success: false,
        error: 'Failed to start email verification process'
      });
    }
  });

  pythonProcess.on('close', (code, signal) => {
    clearTimeout(timeout);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🐍 Python script closed');
    console.log('📊 Exit code:', code);
    console.log('📊 Signal:', signal);
    console.log('⏱️  Duration:', duration + 'ms');
    console.log('📝 Full stdout result:', result);
    console.log('📝 Full stderr error:', error);
    
    if (hasResponded) {
      console.log('⚠️  Response already sent (timeout case)');
      return;
    }
    
    if (code !== 0) {
      console.error('❌ Python script failed with exit code:', code);
      console.error('❌ Python script error output:', error);
      hasResponded = true;
      return res.status(500).json({ 
        success: false, 
        error: `Python script failed: ${error}`,
        exit_code: code
      });
    }
    
    console.log('✅ Python script completed successfully');
    console.log('🔍 Attempting to parse result...');
    
    try {
      const trimmedResult = result.trim();
      console.log('🔍 Trimmed result:', trimmedResult);
      
      if (!trimmedResult) {
        console.error('❌ Empty result from Python script');
        hasResponded = true;
        return res.status(500).json({
          success: false,
          error: 'Empty response from email verification service'
        });
      }
      
      const parsedResult = JSON.parse(trimmedResult);
      console.log('✅ Successfully parsed Python script result:', JSON.stringify(parsedResult, null, 2));
      
      hasResponded = true;
      res.json({
        ...parsedResult,
        processing_time_ms: duration
      });
      
    } catch (parseError) {
      console.error('❌ Failed to parse Python script result');
      console.error('❌ Parse error:', parseError.message);
      console.error('❌ Raw result that failed to parse:', JSON.stringify(result));
      
      hasResponded = true;
      res.status(500).json({ 
        success: false, 
        error: 'Invalid response format from email verification service',
        raw_output: result.substring(0, 500) // Limit output size
      });
    }
  });

  console.log('🚀 Python process spawned, waiting for results...');
});


// ✅ Updated: MongoDB endpoint for saving to waitlist with /api prefix
app.post('/api/join-waitlist', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if email already exists
    const existingUser = await Waitlist.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.json({
        success: true,
        exists: true,
        message: "You're already on the waitlist!",
        email: email
      });
    }

    // Save new email to waitlist
    const newWaitlistEntry = new Waitlist({
      email: email.toLowerCase(),
      createdAt: new Date(),
      timestamp: Date.now(),
      verified: true
    });

    const savedEntry = await newWaitlistEntry.save();
    
    res.json({
      success: true,
      exists: false,
      message: "Successfully joined the waitlist!",
      email: email,
      id: savedEntry._id
    });

  } catch (error) {
    console.error('MongoDB save error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      return res.json({
        success: true,
        exists: true,
        message: "You're already on the waitlist!",
        email: req.body.email
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to join waitlist'
    });
  }
});

// 🆕 NEW: Google email saving endpoint
app.post('/api/save-google-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    console.log('Saving Google email:', email); // Debug log

    // Check if email already exists in waitlist
    const existing = await Waitlist.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist!" 
      });
    }

    // Save new email to existing waitlist schema
    const newEntry = new Waitlist({ 
      email: email.toLowerCase(), 
      createdAt: new Date(),
      timestamp: Date.now(),
      verified: true  // Since Google verified the email
    });
    
    await newEntry.save();
    console.log('Google email saved successfully:', email);

    return res.json({ 
      success: true, 
      exists: false, 
      message: "Welcome to Qlue! You've successfully joined the waitlist." 
    });
    
  } catch (error) {
    console.error('Error saving Google email:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist!" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to save to waitlist' 
    });
  }
});

// ✅ Updated: Get waitlist count with /api prefix
app.get('/api/waitlist-count', async (req, res) => {
  try {
    const count = await Waitlist.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// ✅ Updated: Health check with /api prefix
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: 'mongodb',
    timestamp: new Date().toISOString()
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message 
  });
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
});
