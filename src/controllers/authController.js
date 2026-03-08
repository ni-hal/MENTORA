const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};



module.exports = { signup, login,  };
