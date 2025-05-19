import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  watchlist: [{
    id: String,
    title: String,
    poster_path: String,
    media_type: String,
    date_added: {
      type: Date,
      default: Date.now
    }
  }],
  customLists: [{
    name: String,
    items: [{
      id: String,
      title: String,
      poster_path: String,
      media_type: String
    }]
  }],
  recommendations: [{
    id: String,
    title: String,
    poster_path: String,
    media_type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model('User', userSchema);