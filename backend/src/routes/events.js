const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');

const router = express.Router();

// Validate ":id" once for all routes using the param
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id format' });
  }
  next();
});

// GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
// Lists events for the calendar (optionally filtered by date range)
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.start = {};
      if (from) query.start.$gte = new Date(from);
      if (to)   query.start.$lte = new Date(to);
    }

    const events = await Event.find(query)
      .sort({ start: -1, createdAt: -1 })
      .lean()
      .exec();

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events
// Creates a scheduled item (vet/grooming/litter) OR just a note on a day
router.post('/', async (req, res) => {
  try {
    const { type, start, end, allDay, title, notes } = req.body;
    if (!start) return res.status(400).json({ error: 'Start date is required' });

    // normalize calendar-day clicks to midnight
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    // accept only known types; allow undefined for “note-only” events
    const allowedTypes = ['vet', 'grooming', 'litter'];
    const cleanType = type && allowedTypes.includes(type) ? type : undefined;

    const event = await Event.create({
      type: cleanType,
      start: startDate,
      end,
      allDay: !!allDay,
      title,
      notes: typeof notes === 'string' ? notes : ''
    });

    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ error: 'Failed to create event', details: err.message });
  }
});

// PUT /api/events/:id
// Updates event fields safely (type, date, notes, etc.)
router.put('/:id', async (req, res) => {
  try {
    const update = { ...req.body };

    // keep type in the allowed set
    if (update.type !== undefined) {
      const allowedTypes = ['vet', 'grooming', 'litter'];
      if (!allowedTypes.includes(update.type)) delete update.type;
    }

    // normalize date if provided
    if (update.start) {
      const d = new Date(update.start);
      d.setHours(0, 0, 0, 0);
      update.start = d;
    }

    // sanitize notes
    if (update.notes !== undefined && typeof update.notes !== 'string') {
      update.notes = '';
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).lean().exec();

    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(400).json({ error: 'Failed to update event', details: err.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id).lean().exec();
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(400).json({ error: 'Failed to delete event', details: err.message });
  }
});

module.exports = router;
