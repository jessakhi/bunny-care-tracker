const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    treats: { type: Number, default: 0, min: 0, max: 8 },
    veggies: { type: Number, default: 0, min: 0, max: 10 },
    pellets: { type: Number, default: 0, min: 0, max: 10 },
    hay: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    litter: { type: Boolean, default: false },
    grooming: { type: Boolean, default: false },
    mood: { type: String, enum: ['playful', 'sleepy', 'neutral', 'sad', 'zoomies'], default: 'neutral' },
    freeRoamingMins: { type: Number, default: 0, min: 0, max: 1440 },
    poopQuality: { type: String, enum: ['normal', 'small', 'soft', 'none'], default: 'normal' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', LogSchema);
