const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    // The chosen category (optional if it's just a note)
    type: {
      type: String,
      enum: ['vet', 'grooming', 'litter']
    },

    // Date user clicked in the calendar (always required)
    start: {
      type: Date,
      required: true
    },

    // Optional end (good for future time ranges)
    end: Date,

    // All-day by default (because you’re clicking day squares)
    allDay: {
      type: Boolean,
      default: true
    },

    // Optional title (can be auto-filled by frontend or backend based on type)
    title: String,

    // Notes are optional and can exist without type
    notes: String
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
