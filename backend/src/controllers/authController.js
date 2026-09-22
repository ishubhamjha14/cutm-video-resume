import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Secure verification against configured admin credentials
    const isUsernameMatch = (username.trim() === config.adminUsername);
    const isPasswordMatch = (password === config.adminPassword);

    if (!isUsernameMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: config.adminUsername,
        role: 'admin',
        team: 'Team 03 - Centurion University'
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      user: {
        username: config.adminUsername,
        role: 'admin',
        team: 'Team 03'
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication.'
    });
  }
}

export async function verifySession(req, res) {
  return res.status(200).json({
    success: true,
    user: req.admin
  });
}

export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}
