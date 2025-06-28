import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config( {path: '../.env'} );

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => {
  console.log('✅ MongoDB connected successfully') 
  }).catch((error) => {
  console.error('❌ MongoDB connection error:', error.message)  
  process.exit(1)
  });

// MongoDB Schema
const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'active'
  }
});

const Email = mongoose.model('Waitlist', emailSchema);

// Email verification function using axios
const verifyEmail = async (email) => {
  try {
    const url = 'https://check.emailverifier.online/bulk-verify-email/functions/quick_mail_verify_no_session.php';
    
    const payload = {
      email: email,
      index: 0,
      token: '12345',
      frommail: email,
      timeout: 10,
      scan_port: 25
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000 // 15 second timeout
    });

    const result = response.data;
    console.log('📊 Verification result:', {
      status: result.status,
      safetosend: result.safetosend,
      type: result.type,
      reasons: result.reasons
    });

    return result.status === 'valid' && result.safetosend === 'Yes';
    
  } catch (error) {
    console.error('❌ Email verification failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    return false;
  }
};

// Single endpoint for verify and save
app.post('/api/verify-and-save', async (req, res) => {
  try {

    const { email } = req.body;

    // Better validation
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.log('❌ Invalid email:', email);
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email is required',
        received: email
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

  const existingEmail = await Email.findOne({ email: trimmedEmail });
    if (existingEmail) {
  
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist. Stay tuned!" 
      });
    }

    const isValid = await verifyEmail(trimmedEmail);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email does not exist!.', 
      });
    }

    const newEmail = new Email({ email: trimmedEmail });
    await newEmail.save();
    
    res.json({ 
      success: true, 
      exists: false, 
      message: 'Welcome to Qlue! You have successfully joined the waitlist.' 
    });

  } catch (error) {
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist!" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Google Sign-in email save endpoint (add this to your existing server.js)
app.post('/api/save-google-email', async (req, res) => {
  try {


    const { email } = req.body;

    const trimmedEmail = email.trim().toLowerCase();

    const existingEmail = await Email.findOne({ email: trimmedEmail });
    
    if (existingEmail) {
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist. Stay tuned!" 
      });
    }

    const newEmail = new Email({ email: trimmedEmail });
    await newEmail.save();
    
    
    res.json({ 
      success: true, 
      exists: false, 
      message: "Welcome to Qlue! You've successfully joined the waitlist." 
    });

  } catch (error) {
    console.error('💥 Google sign-in save error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.json({ 
        success: true, 
        exists: true, 
        message: "You're already on the waitlist. Stay tuned!" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Server error while saving Google sign-in' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
