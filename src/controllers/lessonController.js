const Lesson = require('../models/Lesson');
const AppError = require('../utils/AppError');

const createLesson = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      throw new AppError('Lesson title is required', 400);
    }

    const lesson = await Lesson.create({
      title,
      description,
      mentorId: req.user.id
    });

    await lesson.populate('mentorId', 'name email');

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });
  } catch (error) {
    next(error);
  }
};

const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find()
      .populate('mentorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Lessons retrieved successfully',
      data: { lessons }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLesson, getLessons };
