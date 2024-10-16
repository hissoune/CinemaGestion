

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const mailer = require('../utils/mailer');
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const payload = { user: { id: user._id, role: user.role } };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1000h' });

  return token;
};
exports.register = async (data) => {
    const { name, email, password, role } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    const payload = { user: { id: newUser._id, role: newUser.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1000h' });

    return token;
};




exports.logout = async (token) => {
  const decoded = jwt.decode(token);
  
  await Blacklist.create({
    token: token,
    expiresAt: new Date(decoded.exp * 1000),
  });
};

// Request Password Reset Service
exports.requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const resetUrl = `http://localhost:3000/api/reset-password-fromemail/${resetToken}`;
  
  await mailer.sendRessetPass(email, resetUrl);
};

// Reset Password Service
exports.resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(newPassword, salt);

  const user = await User.findByIdAndUpdate(userId, { password: hashedPass });
  if (!user) {
    throw new Error('User not found');
  }
};
exports.Profile = async (token) => {
   

   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.user.id;

  const user = await User.findById(userId);
  
  return user;
}
