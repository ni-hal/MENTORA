const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const AppError = require('../utils/AppError');

const createBooking = async (req, res, next) => {
  try {
    const { studentId, lessonId } = req.body;

    if (!studentId || !lessonId) {
      throw new AppError('Student ID and Lesson ID are required', 400);
    }

    const student = await Student.findById(studentId);

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.parentId.toString() !== req.user.id.toString()) {
      throw new AppError('This student does not belong to you', 403);
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const existingBooking = await Booking.findOne({ studentId, lessonId });
    if (existingBooking) {
      throw new AppError('Student is already booked for this lesson', 400);
    }

    const booking = await Booking.create({ studentId, lessonId });
    await booking.populate([
      { path: 'studentId', populate: { path: 'parentId', select: 'name email' } },
      { path: 'lessonId', populate: { path: 'mentorId', select: 'name email' } }
    ]);

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingId: booking._id,
        student: {
          id: booking.studentId._id,
          name: booking.studentId.name,
          age: booking.studentId.age
        },
        parent: {
          id: booking.studentId.parentId._id,
          name: booking.studentId.parentId.name,
          email: booking.studentId.parentId.email
        },
        lesson: {
          id: booking.lessonId._id,
          title: booking.lessonId.title
        },
        mentor: {
          id: booking.lessonId.mentorId._id,
          name: booking.lessonId.mentorId.name
        }
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid ID format', 400));
    }
    if (error.name === 'ValidationError') {
      return next(new AppError(error.message, 400));
    }
    if (error.code === 11000) {
      return next(new AppError('Student is already booked for this lesson', 400));
    }
    if (!error.statusCode) {
      return next(new AppError(error.message, 500));
    }
    next(error);
  }
};

module.exports = { createBooking };
