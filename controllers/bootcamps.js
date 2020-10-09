const path = require('path');
const ErrorResponse = require('../utils/errorResponse')
const { Bootcamp, BootcampSchema } = require("../models/Bootcamp");
const asyncHandler = require("../middleware/async");
const geocoder = require('../utils/geocoder.js')

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy req.query to reqQuery
  let reqQuery = { ...req.query };

  // list of sellectors to be considerd
  const selectorsToRemove = ['select', 'sort', 'limit', 'page']

  // Reomve select form query
  selectorsToRemove.forEach(selector => {
    delete reqQuery[selector]
  })

  queryStr = JSON.stringify(reqQuery)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${ match }`)


  query = Bootcamp.find(JSON.parse(queryStr)).populate({
    path: 'courses',
    select: 'title description -bootcamp'
  })

  //Select
  if (req.query.select) {
    // extract list of selection parms
    let querySelect = req.query.select.split(',').join(' ');
    query = query.select(querySelect)
  }

  // Sort
  if (req.query.sort) {
    let querySort = req.query.sort.split(',').join(' ');
    query = query.sort(querySort)
  } else {
    query = query.sort('-createdAt')
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalPages = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < totalPages) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }
  //Excuting query
  const bootcamps = await query

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
    data: bootcamps,

  });
});

// @desc    Get bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

  const bootcamp = await (await Bootcamp.findById(req.params.id).populate({ path: 'courses', select: 'title description -bootcamp' })).populate('avragedTuition');
  if (!bootcamp) {
    return next(err);
  }
  res.status(200).json({ success: true, data: bootcamp });

});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return res
      .status(400)
      .json({ success: false, message: `Error: boot camp dosenot exist!` });
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new Error('Bootcamp not found'))
  }

  await bootcamp.remove();

  res.status(200).json({
    success: true,
    count: 1,
    bootcampsDeleted: {
      name: bootcamp.name,
      _id
    },
    coursesToDelete: {
      count: BootcampSchema.coursesToDelete.length,
      name: BootcampSchema.coursesToDelete.map(val => val.title)
    }
  });
});


// @desc    Get bootcamp within a radious
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance/:units
// @access  Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  console.log(JSON.stringify(req.query))
  // Get lat/lng form the geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dista by radius of Earth radius
  // Earth Radius = 3,936 mil / 6,371 klm

  const radius = distance / 3936;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius]
      }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });

});


// @desc    Upload Photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${ req.params.id }`, 400)
    )
  }

  if (!req.files)
    return next(
      new ErrorResponse(`Please upolad a file`, 400)
    )

  const file = req.files.file

  // Make sure the image if a photo
  if (!file.mimetype.startsWith("image")) {
    return next(
      new ErrorResponse(`Please upload an image file`, 400))
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image file smaller than ${Math.ceil(((process.env.MAX_FILE_UPLOAD/1024)*10)/10)}KB`,400))
  }

  // Create custom filename
  file.name = `photo_${ bootcamp._id }${ path.parse(file.name).ext }`;

  file.mv(`${ process.env.FILE_UPLOAD_PATH }/${ file.name }`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500))
    }
    
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });

});