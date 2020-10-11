const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const UserSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Please add a name']
   },
   email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
         /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
         'Please add a valid email address'
      ]
   },
   role: {
      type: String,
      enum: ['user', 'publisher'],
      default: 'user'
   },
   password: {
      type: String,
      required: [true, 'Please add a valid password'],
      minimum: 6,
      select: false
   },
   resetPasswordToken: String,
   resetPasswordExpire: Date,
   createdAt: {
      type: Date,
      default: Date.now
   }
} );

UserSchema.pre( 'save', async function ( next ) {
   const salt = await bcryptjs.genSalt(10)
   this.password = await bcryptjs.hash( this.password, salt )
   next()
})

module.exports = mongoose.model('User', UserSchema);