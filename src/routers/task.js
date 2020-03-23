const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

// Task Model
const Task = require('../models/task');

// Create New Task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

// Get All Tasks
router.get('/tasksAll', auth, async (req, res) => {

    const pageOptions = {
        limit: parseInt(req.query.limit) || null,
        skip: parseInt(req.query.skip) || null
    };

    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        const tasks = await Task.find({}).sort(sort).limit(pageOptions.limit).skip(pageOptions.skip);
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
})

// Get All Tasks
// ?completed=boolean
// ?limit=number&skip=number
// ?sortBy=createdAt:asc||desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({
        //     owner: req.user._id
        // }); // Alternative
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
})

// Get Single Task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})

// Update Single Task
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        res.status(400).send({
            error: 'Invalid update params'
        });
    }

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

// Delete Single Task
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;