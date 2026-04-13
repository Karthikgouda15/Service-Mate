const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Extended for seamless demonstration
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    });
};

module.exports = { generateToken, generateRefreshToken };
