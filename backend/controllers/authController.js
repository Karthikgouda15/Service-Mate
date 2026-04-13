const User = require('../models/User');
const Provider = require('../models/Provider');
const { generateToken, generateRefreshToken } = require('../utils/auth');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    try {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const phoneExists = await User.findOne({ phone });
        if (phoneExists) {
            return res.status(400).json({ message: 'An account with this phone number already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role
        });

        if (role === 'provider') {
            await Provider.create({
                userId: user._id,
                services: [
                    { category: 'General', subcategory: 'General Service', basePrice: 100, priceUnit: 'hr' }
                ],
                currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Default Bangalore
                isOnline: false
            });
        }

        if (user) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: accessToken
            });
        }
    } catch (error) {
        // Catch MongoDB duplicate key errors gracefully
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `An account with this ${field} already exists` });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            user.refreshToken = refreshToken;
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: accessToken
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const accessToken = generateToken(user._id);
        res.json({ token: accessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get OTP
        const otp = user.getResetPasswordOTP();

        await user.save({ validateBeforeSave: false });

        const message = `You requested a password reset. Your OTP is: ${otp}`;
        const html = `
            <h3>ServiceMate Password Reset</h3>
            <p>You have requested to reset your password. Use the following OTP to securely create a new password:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 15px; background: #F5F5F7; display: inline-block; border-radius: 8px; margin: 20px 0;">
                ${otp}
            </div>
            <p><small>OTP expires in 10 minutes.</small></p>
        `;

        console.log(`\n\n[DEVELOPMENT ONLY] Your Password Reset OTP for ${user.email} is: ${otp}\n\n`);

        try {
            // Attempt to send email, but don't fail if credentials are missing
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message,
                html
            });
        } catch (err) {
            console.warn('⚠️ Nodemailer warning:', err.message);
            console.log('Skipping real email dispatch. OTP printed to console above.');
        }
        
        // Return success and include the OTP for "Demo Mode" end-to-end frontend connection
        res.status(200).json({ 
            message: 'OTP sent successfully',
            demo_otp: otp
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password via OTP
// @route   PUT /api/auth/resetpassword
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
        }

        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated securely' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.refreshToken = '';
        await user.save();
    }
    res.json({ message: 'Logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    forgotPassword,
    resetPassword
};
