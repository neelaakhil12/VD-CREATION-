// server.js - Backend Node.js Express server for VD CREATION
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Local Orders JSON File Backup Store
const LOCAL_ORDERS_FILE = path.join(__dirname, 'data', 'local_orders.json');

function getLocalOrders() {
  try {
    if (fs.existsSync(LOCAL_ORDERS_FILE)) {
      const data = fs.readFileSync(LOCAL_ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading local orders JSON:", e);
  }
  return [];
}

function saveLocalOrders(orders) {
  try {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (e) {
    console.error("Error saving local orders JSON:", e);
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and Parser configurations
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets and files
app.use(express.static(path.join(__dirname)));

// Route for /admin redirection
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Secure endpoint to upload base64 images to Cloudinary
app.post('/api/upload', async (req, res) => {
  try {
    const { image, folder } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image data provided. Request must include a base64 image.' });
    }

    // Set destination folder on Cloudinary
    const uploadFolder = folder || 'vd_creations_orders';

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: uploadFolder,
      resource_type: 'auto'
    });

    console.log(`[Cloudinary] Image uploaded successfully to folder: ${uploadFolder}. URL: ${uploadResponse.secure_url}`);
    
    res.json({ 
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id
    });
  } catch (error) {
    console.error('[Cloudinary] Upload error details:', error);
    res.status(500).json({ error: 'Failed to upload image to Cloudinary.', details: error.message });
  }
});

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Configure Razorpay Payment Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TGUiQdpbxC35Go',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'G8DOZwMtSxyPrR3XaN0lqoql'
});

// Endpoint to fetch public Razorpay Key ID
app.get('/api/razorpay-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TGUiQdpbxC35Go' });
});

// Endpoint to create a Razorpay Order
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const options = {
      amount: Math.round(parseFloat(amount) * 100), // Amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    console.log(`[Razorpay] Created order ${order.id} for amount ₹${amount}`);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TGUiQdpbxC35Go'
    });
  } catch (error) {
    console.error('[Razorpay] Order creation failed:', error);
    res.status(500).json({ error: 'Failed to create Razorpay payment order.', details: error.message });
  }
});

// Endpoint to verify Razorpay Payment signature
app.post('/api/verify-razorpay-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment signature verification parameters.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'G8DOZwMtSxyPrR3XaN0lqoql';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      console.log(`[Razorpay] Payment ${razorpay_payment_id} verified successfully for order ${razorpay_order_id}!`);
      res.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      console.warn(`[Razorpay] Signature mismatch for payment ${razorpay_payment_id}.`);
      res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }
  } catch (error) {
    console.error('[Razorpay] Verification error:', error);
    res.status(500).json({ success: false, error: 'Payment verification failed.', details: error.message });
  }
});

// ====================================================================
// ADMIN AUTHENTICATION & NODEMAILER SMTP PASSWORD RESET
// ====================================================================
const nodemailer = require('nodemailer');

// Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'vdcreationz02@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'vlbqagslrbcqlhhg'
  }
});

const credsPath = path.join(__dirname, 'data', 'admin_credentials.json');
const tokensPath = path.join(__dirname, 'data', 'admin_tokens.json');

function getAdminCredentials() {
  try {
    if (fs.existsSync(credsPath)) {
      return JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
    }
  } catch (e) {}
  return { email: 'vdcreationz02@gmail.com', password: 'admin123' };
}

function saveAdminCredentials(creds) {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
}

function getResetTokens() {
  try {
    if (fs.existsSync(tokensPath)) {
      return JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function saveResetTokens(tokens) {
  const dir = path.join(__dirname, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
}

// Endpoint: Save Order locally & sync
app.post('/api/save-order', (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.id) {
      return res.status(400).json({ error: 'Order data with ID is required.' });
    }

    const orders = getLocalOrders();
    const existingIdx = orders.findIndex(o => o.id === orderData.id);
    if (existingIdx > -1) {
      orders[existingIdx] = { ...orders[existingIdx], ...orderData };
    } else {
      orders.unshift({
        ...orderData,
        created_at: orderData.created_at || new Date().toISOString()
      });
    }

    saveLocalOrders(orders);
    console.log(`[Local Order Store] Order ${orderData.id} saved successfully! Total local orders: ${orders.length}`);
    res.json({ success: true, id: orderData.id });
  } catch (err) {
    console.error("[Local Order Store Error]:", err);
    res.status(500).json({ error: 'Failed to save local order.' });
  }
});

// Endpoint: Fetch Admin Orders Backup
app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = getLocalOrders();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read local orders.' });
  }
});

// Endpoint: Update Local Order Status / Proof / Tracking
app.post('/api/admin/update-order', (req, res) => {
  try {
    const { id, status, proof_url, courier_name, tracking_id, tracking_link } = req.body;
    const orders = getLocalOrders();
    let ord = orders.find(o => 
      o.id === id || 
      o.supabase_id === id || 
      (o.id && id && o.id.slice(0, 8) === id.slice(0, 8))
    );

    if (!ord) {
      ord = { id: id, created_at: new Date().toISOString() };
      orders.unshift(ord);
    }

    if (status !== undefined) ord.status = status;
    if (proof_url !== undefined) ord.proof_url = proof_url;
    if (courier_name !== undefined) ord.courier_name = courier_name;
    if (tracking_id !== undefined) ord.tracking_id = tracking_id;
    if (tracking_link !== undefined) ord.tracking_link = tracking_link;
    
    saveLocalOrders(orders);
    console.log(`[Local Order Update] Order ${id} updated with Courier: ${courier_name}, Tracking ID: ${tracking_id}, Link: ${tracking_link}`);
    res.json({ success: true, order: ord });
  } catch (e) {
    console.error("[Local Order Update Error]:", e);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

// Endpoint: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const currentCreds = getAdminCredentials();

  if ((email.toLowerCase() === currentCreds.email.toLowerCase() || email.toLowerCase() === 'admin@vdcreation.com') && password === currentCreds.password) {
    return res.json({
      success: true,
      user: { email: currentCreds.email, id: 'admin-1' },
      token: 'adm_session_' + Date.now()
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid admin email or password.' });
});

// Endpoint: Forgot Password via Nodemailer SMTP
app.post('/api/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Admin email address is required.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000;

    const tokens = getResetTokens();
    tokens[token] = { email, otpCode, expires };
    tokens[otpCode] = { email, token, expires };
    saveResetTokens(tokens);

    const resetUrl = `http://localhost:${PORT}/admin?reset_token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"VD Creation Admin" <vdcreationz02@gmail.com>',
      to: email,
      subject: '🔑 VD CREATION Admin Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #050e1a; color: #ffffff; padding: 30px; border-radius: 16px; max-width: 600px; margin: auto;">
          <h2 style="color: #D4AF37; margin-top: 0; text-align: center;">VD CREATION STUDIO</h2>
          <p style="color: #d1d5db; font-size: 14px;">You have requested a password reset for the VD Creation Admin Control Center.</p>
          
          <div style="background-color: #0b1f3a; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: bold;">Your 6-Digit OTP Code</p>
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #D4AF37;">${otpCode}</span>
          </div>

          <p style="color: #d1d5db; font-size: 14px;">Or click the direct reset link below to update your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #D4AF37; color: #0b1f3a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; display: inline-block;">Reset Admin Password</a>
          </div>

          <p style="color: #6b7280; font-size: 11px; text-align: center;">This request will expire in 15 minutes.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Reset email sent successfully to ${email}`);
    res.json({ success: true, message: `Password reset instructions & OTP sent to ${email}!` });
  } catch (err) {
    console.error('[SMTP Error]:', err);
    res.status(500).json({ error: `Failed to send password reset email: ${err.message}` });
  }
});

// Endpoint: Reset Password
app.post('/api/admin/reset-password', (req, res) => {
  try {
    const { tokenOrOtp, newPassword } = req.body;
    if (!tokenOrOtp || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid OTP / Token and a new password (min 6 characters) are required.' });
    }

    const tokens = getResetTokens();
    const record = tokens[tokenOrOtp];

    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired OTP code or reset link.' });
    }

    const creds = getAdminCredentials();
    creds.password = newPassword;
    creds.updatedAt = new Date().toISOString();
    saveAdminCredentials(creds);

    delete tokens[tokenOrOtp];
    if (record.token) delete tokens[record.token];
    if (record.otpCode) delete tokens[record.otpCode];
    saveResetTokens(tokens);

    console.log(`[Admin Password] Password updated successfully in database!`);
    res.json({ success: true, message: 'Admin password updated successfully! You can now sign in with your new password.' });
  } catch (err) {
    console.error('[Password Reset Error]:', err);
    res.status(500).json({ error: 'Failed to reset admin password.' });
  }
});
app.get('*', (req, res, next) => {
  // If request is for an asset/file, let static middleware handle it
  if (req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('==========================================================');
  console.log(`        VD CREATION - BACKEND DEV EXPRESS SERVER          `);
  console.log('==========================================================');
  console.log(` Web Server running at: http://localhost:${PORT}/`);
  console.log(` Admin Page:           http://localhost:${PORT}/admin`);
  console.log(' Press Ctrl+C in this terminal to stop the server.');
  console.log('==========================================================');
});
