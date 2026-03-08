const Session = require('../models/Session');
const Lesson = require('../models/Lesson');
const AppError = require('../utils/AppError');

const createSession = async (req, res, next) => {
  try {
    const { lessonId, title, scheduledAt, duration } = req.body;

    if (!lessonId || !title || !scheduledAt || !duration) {
      throw new AppError('All fields are required', 400);
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    if (lesson.mentorId.toString() !== req.user.id) {
      throw new AppError('You can only create sessions for your own lessons', 403);
    }

    const session = await Session.create({
      lessonId,
      title,
      scheduledAt: new Date(scheduledAt),
      duration: parseInt(duration)
    });

    await session.populate({
      path: 'lessonId',
      populate: { path: 'mentorId', select: 'name' }
    });

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      success: true,
      message: 'Session created successfully',
      data: {
        id: session._id,
        title: session.title,
        lessonTitle: session.lessonId.title,
        mentorName: session.lessonId.mentorId.name,
        scheduledAt: session.scheduledAt,
        duration: session.duration
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid lesson ID format', 400));
    }
    if (error.name === 'ValidationError') {
      return next(new AppError(error.message, 400));
    }
    if (!error.statusCode) {
      return next(new AppError(error.message, 500));
    }
    next(error);
  }
};

const getLessonSessions = async (req, res, next) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const sessions = await Session.find({ lessonId })
      .populate({
        path: 'lessonId',
        populate: { path: 'mentorId', select: 'name' }
      })
      .sort({ scheduledAt: 1 });

    const formattedSessions = sessions.map(session => ({
      id: session._id,
      title: session.title,
      lessonTitle: session.lessonId.title,
      mentorName: session.lessonId.mentorId.name,
      scheduledAt: session.scheduledAt,
      duration: session.duration
    }));

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Sessions retrieved successfully',
      data: { sessions: formattedSessions }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid lesson ID format', 400));
    }
    if (!error.statusCode) {
      return next(new AppError(error.message, 500));
    }
    next(error);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate({
        path: 'lessonId',
        populate: { path: 'mentorId', select: 'name' }
      });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Session retrieved successfully',
      data: {
        id: session._id,
        title: session.title,
        lessonTitle: session.lessonId.title,
        mentorName: session.lessonId.mentorId.name,
        scheduledAt: session.scheduledAt,
        duration: session.duration
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid session ID format', 400));
    }
    if (!error.statusCode) {
      return next(new AppError(error.message, 500));
    }
    next(error);
  }
};

module.exports = { createSession, getLessonSessions, getSessionById };
