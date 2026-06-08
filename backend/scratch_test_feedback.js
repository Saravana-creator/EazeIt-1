const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Force DNS resolvers to prevent Atlas ECONNREFUSED
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  console.warn("⚠️ DNS configuration warning:", dnsErr.message);
}

// Load environment variables from .env
dotenv.config();

const Feedback = require('./Models/FeedbackModel');

async function test() {
  const mongoUrl = process.env.MONGO_URL;
  console.log('Connecting to:', mongoUrl);
  if (!mongoUrl) {
    console.error('MONGO_URL not found in environment!');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected successfully!');

    const feedback = new Feedback({
      name: 'Test Name',
      email: 'test@example.com',
      phone: '1234567890',
      subject: 'Test Subject',
      message: 'Test message content',
      submittedBy: 'test@example.com'
    });

    console.log('Saving feedback...');
    const saved = await feedback.save();
    console.log('Saved successfully:', saved);

    await mongoose.connection.close();
    console.log('Disconnected!');
  } catch (err) {
    console.error('Error occurred:', err);
    process.exit(1);
  }
}

test();
