const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['athlete', 'coach', 'admin'],
      default: 'athlete',
    },
    battingRole: {
      type: String,
      default: 'Opening Batter',
      trim: true,
    },
    battingStyle: {
      type: String,
      default: 'Right-Handed',
      trim: true,
    },
    team: {
      type: String,
      default: 'Delhi Cricket Club',
      trim: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banType: {
      type: String,
      enum: ['temporary', 'permanent', null],
      default: null,
    },
    banUntil: {
      type: Date,
      default: null,
    },
    banReason: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
