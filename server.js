require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { limiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const studentRoutes = require('./src/routes/studentRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const llmRoutes = require('./src/routes/llmRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Education Platform API',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/llm', llmRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
