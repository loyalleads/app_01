
const { Schema } = require("mongoose")

const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
   title: {
      type: String,
      trim: true,
      required: [true,'Please add a course title']
   },
   description: {
      type: String,
      required: [true,'Please add a description']
   },
   weeks: {
      type: String,
      required: [true,'Please add number of weeks']
   },
   tuition: {
      type: Number,
      required: [true,'Please add a tuition cost']
   },
   minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill'],
      enum:['beginner','intermediate','advanced']
   },
   scholarhipsAvailable: {
      type: Boolean,
      default: false
   },
   createdAt: {
      type: Date,
      default: Date.now
   },
   bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: [true,'Please add a bootcamp']
   }
})

// static method to get avrage of course tuitions
CourseSchema.statics.getAvrageCost = async function (bootcampId) {
   const obj = await this.aggregate([
      { $match: { bootcamp: bootcampId } },
      { $group: { _id: '$bootcamp', averageCost: { $avg: '$tuition' } } }
   ]);

   try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
         averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      })
   }
   catch (err) {
      console.error(err);
   }
   
}

// Call getAvrageCost after save to
CourseSchema.post('save', function (next) {
   this.constructor.getAvrageCost(this.bootcamp);
   
})

// Call getAvrageCost before remove
CourseSchema.pre('remove', function(next){
   this.constructor.getAvrageCost(this.bootcamp);
})

module.exports = mongoose.model('Course',CourseSchema)