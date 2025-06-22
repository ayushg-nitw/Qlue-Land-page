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
  message: 'Too many requests from this IP'
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    setHeaders: (res, path) => {
      // Set security headers for static files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }
  }));
}
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






// ✅ Updated: Email verification endpoint with /api prefix
app.post('/api/verify-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }
  
  const pythonScript = path.join(__dirname, 'email-check.py');
  const pythonProcess = spawn('python3', ['-u', pythonScript, email]);
  
  let result = '';
  let error = '';

  pythonProcess.stdout.on('data', (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ 
        success: false, 
        error: `Python script failed: ${error}` 
      });
    }
    
    try {
      const parsedResult = JSON.parse(result.trim());
      res.json(parsedResult);
    } catch (e) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to parse result' 
      });
    }
  });
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


app.get('/{*any}', (req, res)=>{
   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
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
