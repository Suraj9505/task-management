import Task from '../models/task.js';

export const createTask = async (req, res) => {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    try {
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            status,
            assignedTo,
            createdBy: req.user.id
        });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTasks = async (req, res) => {
    const { search, status, priority, dueDate } = req.query;

    const query = {
        $or: [
            { createdBy: req.user.id },
            { assignedTo: req.user.id }
        ]
    };

    if (search) {
        query.$and = [{
            $or: [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ]
        }];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (dueDate) query.dueDate = { $lte: new Date(dueDate) };

    try {
        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ dueDate: 1 });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
