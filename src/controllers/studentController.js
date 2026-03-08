const Student = require('../models/Student');
const AppError = require('../utils/AppError');

const createStudent = async (req, res, next) => {
  try {
    const { name, age } = req.body;

    if (!name) {
      throw new AppError('Student name is required', 400);
    }

    const existingStudent = await Student.findOne({ name, parentId: req.user.id });
    if (existingStudent) {
      throw new AppError('A student with this name already exists', 400);
    }

    const student = await Student.create({
      name,
      age: age ? parseInt(age) : null,
      parentId: req.user.id
    });

    await student.populate('parentId', 'name email');

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      success: true,
      message: 'Student created successfully',
      data: { student }
    });
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ parentId: req.user.id })
      .populate('parentId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      success: true,
      message: 'Students retrieved successfully',
      data: { students }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStudent, getStudents };
