const express = require('express');
const mongoose = require('mongoose');           // ✅ add this
const Log = require('../models/Log');           // you can keep the name Loq if you want
const router = express.Router();

// normalize numbers (with min/max bounds)
const num = (v, min = 0, max = Infinity) => {
  if (v === undefined || v === null || v === '') return min;
  const n = Number(v);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(n, max));
};

// validate ":id"
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid id format' });
  }
  next();
});

// safe date parser (unused right now but handy)
const parseDate = (v) => {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

// whitelist to prevent over-posting
const pick = (src, keys) =>
  Object.fromEntries(keys.map(k => [k, src[k]]).filter(([, v]) => v !== undefined));

const allowedFields = [
  'date','treats','veggies','pellets','hay','water','litter','grooming',
  'mood','freeRoamingMins','poopQuality','notes'
];

// GET /api/logs?from&to
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to)   query.date.$lte = new Date(to);
    }

    const logs = await Log.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean()
      .exec();

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/logs
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.date) data.date = new Date();
    else data.date = new Date(data.date);
    data.date.setHours(0, 0, 0, 0); // start of day

    // numbers with bounds
    data.treats = num(data.treats, 0, 8);
    data.veggies = num(data.veggies, 0, 10);
    data.pellets = num(data.pellets, 0, 10);
    data.freeRoamingMins = num(data.freeRoamingMins, 0, 1440);

    // booleans
    data.hay = !!data.hay;
    data.water = !!data.water;
    data.litter = !!data.litter;
    data.grooming = !!data.grooming;

    // mood
    const allowedMoods = ['playful','sleepy','neutral','sad','zoomies'];
    data.mood = (data.mood || 'neutral').toLowerCase();
    if (!allowedMoods.includes(data.mood)) data.mood = 'neutral';

    // poop quality
    const allowedPoopQualities = ['normal','small','soft','none'];
    data.poopQuality = (data.poopQuality || 'normal').toLowerCase();
    if (!allowedPoopQualities.includes(data.poopQuality)) data.poopQuality = 'normal';

    // notes (✅ fix)
    if (typeof data.notes !== 'string') data.notes = '';

    const log = await Log.create(pick(data, allowedFields));
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(400).json({ error: 'Internal server error' });
  }
});

// PUT /api/logs/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await Log.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean().exec();

    if (!updated) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(400).json({ error: 'Internal server error' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Log.findByIdAndDelete(req.params.id).lean().exec();
    if (!deleted) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
