const asyncHandler = require('../middleware/async');
const { Bootcamp } = require('../models/Bootcamp');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse')



// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bottcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
   

   if (req.params.bootcampId) {
      const courses = await Course.find({ bootcamp: req.params.bootcampId });

      return res.status(200).json({
         success: true,
         count: courses.length,
         data: courses
      });
   } else {
      res.status(200).json(res.advancedResults);
   }
});

// @desc    Get course by id
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {

   const course = await Course.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
   });

   if (!course) {
      return next(new ErrorResponse(`No course with id # ${ req.params.id }`, 404));
   }
   res.status(200).json({
      success: true,
      data: course
   });

});

// @desc    add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses/
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {

   req.body.bootcamp = req.params.bootcampId
   const bootcamp = await Bootcamp.findById(req.params.bootcampId)
   if (!bootcamp) {
      
      res.status(400).json({ success: false, message: `Bootcamp # ${ req.params.bootcampId } is not a valid course` });
   }
   const course = await Course.create(req.body);

   res.status(201).json({
      success: true,
      data: course,
   });
});

// @desc    Update course
// @route   POST /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {

   const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
   });
   if (!course) {
      res.status(400).json({ success: false, message: `course dosent exist` });
   }
   res.status(200).json({
      success: true,
      data: course
   });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {

   const course = await Course.findByIdAndDelete(req.params.id);
   if (!course) {
      res.status(400).json({ success: false, message: `course dosent exist` });
   }
   res.status(200).json({
      success: true,
      data: {}
   });
});