let { User, Story, Project, Sprint, SprintStory, Task, TaskWork } = require('../models');
const Op = require('sequelize').Op;

let single = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id'] },
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ],
        attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.productOwner.id == req.payload.id;
    const isScrumMaster = foundProject.scrumMaster.id == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: "Only an admin, product owner, scrum master or project member can view this story!" });

    let foundStory = await Story.findOne({
        where: {
            [Op.and]: [
                { 'idProject': req.params.projectId },
                { 'id': req.params.storyId },
                { 'isDeleted': false }
            ]
        }
    });

    if(!foundStory)
        return res.status(404).json({ 'message': 'Invalid story ID' });

    return res.status(200).json(foundStory);
}

let multiple = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id'] },
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ],
        attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
    });
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.productOwner.id == req.payload.id;
    const isScrumMaster = foundProject.scrumMaster.id == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);

    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: 'Only an admin, product owner, scrum master or project member can view project\'s stories!' });

    let foundStories = await Story.findAll({
        where: {
            [Op.and]: [
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        }
    });

    if(foundStories.length === 0)
        return res.status(404).json({});
    
    return res.status(200).json(foundStories);
}

// NOTE: `isAccepted` is ignored as creating an already accepted story does not make sense
let create = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id'] },
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ],
        attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.productOwner.id == req.payload.id;
    const isScrumMaster = foundProject.scrumMaster.id == req.payload.id;
    if(!isAdmin && !isScrumMaster && !isProductOwner)
        return res.status(401).json({ message: 'Only an admin, scrum master or product owner can add a new user story!' });
    
    const body = req.body;
    try {
        let createdStory = await Story.create({
            name: body.name,
            description: body.description,
            acceptanceTests: body.acceptanceTests,
            priority: body.priority,
            businessValue: body.businessValue,
            sizePts: body.sizePts,
            idProject: foundProject.id
        });

        delete createdStory.dataValues.createdAt;
        delete createdStory.dataValues.updatedAt;
        delete createdStory.dataValues.idProject;
        return res.status(201).json(createdStory);
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

// NOTE: this method does not support changing the project, to which a story belongs -
// to do that, you first have to delete a story and then create it again
// NOTE 2: you cannot change the `isAccepted` field via this method - it's read only and set only
// when accepting a story in specific sprint
let update = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    if(!isAdmin && !isScrumMaster && !isProductOwner)
        return res.status(401).json({ message: 'Only an admin, scrum master or product owner can update a user story!' });

    const body = req.body;
    let foundStory = await Story.findOne({
        where: {
            [Op.and]: [
                { 'idProject': req.params.projectId },
                { 'id': req.params.storyId }, 
                { 'isDeleted': false }
            ]
        },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if(!foundStory)
        return res.status(404).json({ 'message': 'Invalid story ID' });

    if(foundStory.isAccepted)
        return res.status(400).json({ message: 'Cannot update an already accepted story' });

    let sprintAssignment = await SprintStory.findOne({
        where: { idStory: req.params.storyId }
    });

    if(sprintAssignment)
        return res.status(400).json({ message: `Cannot update a story that is assigned to a sprint (sprint#${sprintAssignment.idSprint})`});

    if(body.name)
        foundStory.name = body.name;
    if(body.description)
        foundStory.description = body.description;
    if(body.acceptanceTests)
        foundStory.acceptanceTests = body.acceptanceTests;
    if(body.priority)
        foundStory.priority = body.priority;
    if(body.businessValue)
        foundStory.businessValue = body.businessValue;
    // Note: allow `null` (means that a story is not estimated yet)
    if(body.sizePts !== undefined)
        foundStory.sizePts = body.sizePts;
    
    try {
        await foundStory.save();
        delete foundStory.dataValues.updatedAt;
        delete foundStory.dataValues.idProject;
        return res.status(200).json(foundStory);
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let remove = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });
    
    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    if(!isAdmin && !isScrumMaster && !isProductOwner)
        return res.status(401).json({ message: 'Only an admin, scrum master or product owner can delete a user story!' });

    let foundStory = await Story.findOne({
        where: {
            [Op.and]: [
                { 'idProject': req.params.projectId },
                { 'id': req.params.storyId },
                { 'isDeleted': false }
            ]
        },
        attributes: ['id']
    });

    // Note: returns 200 even if deleting a story from a project it doesn't exist in -
    // it is implemented this way to be consistent with deleting a user from project
    if(!foundStory)
        return res.status(200).json({});

    if(foundStory.isAccepted)
        return res.status(400).json({ message: 'Cannot delete an already accepted story' })

    let sprintAssignment = await SprintStory.findOne({
        where: { idStory: req.params.storyId }
    });

    if(sprintAssignment)
        return res.status(400).json({ message: `Cannot delete a story that is assigned to a sprint (sprint#${sprintAssignment.idSprint})`});

    try {
        foundStory.isDeleted = true;
        await foundStory.save();
        return res.status(200).json({});
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({});
    }
}

let updateSprintStory = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });
    const body = req.body;

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });
    
    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(400).json({ 'message': 'Only an admin, product owner, scrum master or user can update a sprint story!' });
    
    if((body.isAccepted !== undefined || body.reviewComment !== undefined) && !isProductOwner && !isAdmin)
        return res.status(400).json({ 'message': 'Only an admin or product owner can accept a sprint story!' });
    
    let sprintInCurrProject = await Sprint.findOne({
        where: {
            [Op.and]: [
                { id: req.params.sprintId },
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        }
    });
    if(!sprintInCurrProject)
        return res.status(404).json({ message: 'Invalid sprint for selected project' });

    let storyInCurrSprint = await SprintStory.findOne({
        where: {
            [Op.and]: [
                { idSprint: req.params.sprintId },
                { idStory: req.params.storyId }
            ]
        }
    });
    if(!storyInCurrSprint)
        return res.status(404).json({ message: 'Invalid story for selected sprint' });

    if(!sprintInCurrProject.isActive())
        return res.status(400).json({ message: 'Cannot accept a story in inactive sprint' });

    if(!storyInCurrSprint.isReady && body.isAccepted === true)
        return res.status(400).json({ message: 'Cannot accept a story that is not marked as ready' });
    
    // Check that the story was not accepted in some previous sprint
    let prevEditionsOfStory = await SprintStory.findAll({
        where: {
            [Op.and]: [
                { idStory: req.params.storyId },
                { isAccepted: true },
                { idSprint: { [Op.not]: req.params.sprintId } }
            ]
        }
    });
    if(prevEditionsOfStory.length > 0)
        return res.status(400).json({ message: `A story was already accepted in some other sprint (#${prevEditionsOfStory.sprintId})` });

    let foundStory = await Story.findByPk(req.params.storyId, {
        where: { isDeleted: false }
    });
    // a product owner is accepting a story
    if(body.isAccepted !== undefined) {
        storyInCurrSprint.isAccepted = body.isAccepted;
        foundStory.isAccepted = body.isAccepted;
        foundStory.idSprintCompleted = body.isAccepted? storyInCurrSprint.idSprint: null;
        
        if(body.reviewComment !== undefined)
            storyInCurrSprint.reviewComment = body.reviewComment;
    }

    try {
        await storyInCurrSprint.save();
        await foundStory.save();
        return res.status(200).json({});
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let addStoryTask = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isScrumMaster && !isUser)
        return res.status(401).json({ message: 'Only an admin, scrum master or user can add task to this story!' });

    let sprintInCurrProject = await Sprint.findOne({
        where: {
            [Op.and]: [
                { id: req.params.sprintId },
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        }
    });
    if(!sprintInCurrProject)
        return res.status(404).json({ message: 'Invalid sprint for selected project' });

    let storyInCurrSprint = await SprintStory.findOne({
        where: {
            [Op.and]: [
                { idSprint: req.params.sprintId },
                { idStory: req.params.storyId }
            ]
        }
    });
    if(!storyInCurrSprint)
        return res.status(404).json({ message: 'Invalid story for selected sprint' });

    if(!sprintInCurrProject.isActive())
        return res.status(400).json({ 'message': `Cannot create task for story in inactive sprint (starts ${foundSprint.startDate.toISOString()})` });

    const body = req.body;
    let idAssignedUser = null;
    if(body.idAssignedUser) {
        let foundUser = await User.findByPk(body.idAssignedUser);
        if(!foundUser)
            return res.status(400).json({ message: 'Assigned user does not exist' });
        
        const isInProject = foundProject.idScrumMaster == foundUser.id || foundProject.users.find(u => u.id == foundUser.id);
        if(!isInProject)
            return res.status(400).json({ message: 'Assigned user does not belong to project' });
        
        idAssignedUser = body.idAssignedUser;
    }
    
    try {
        let createdTask = await Task.create({
            description: body.description,
            timeEstimateHrs: body.timeEstimateHrs,
            idAssignedUser: idAssignedUser,
            idSprintStory: storyInCurrSprint.id,
            userConfirmed: false,
            isReady: false
        });

        let refetchedTask = await Task.findByPk(createdTask.id, {
            include: [
                { model: User, as: 'assignedUser', required: false, attributes: ['id', 'username'] }
            ],
            attributes: { exclude: ['idAssignedUser'] }
        });
        return res.status(200).json(refetchedTask);
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

// Note: changing the sprint that a task is made for is not supported via this method
let updateStoryTask = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isScrumMaster && !isUser)
        return res.status(401).json({ message: 'Only an admin, scrum master or user can change this task!' });

    let sprintInCurrProject = await Sprint.findOne({
        where: {
            [Op.and]: [
                { id: req.params.sprintId },
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        }
    });
    if(!sprintInCurrProject)
        return res.status(404).json({ message: 'Invalid sprint ID for selected project' });
    
    let storyInCurrSprint = await SprintStory.findOne({
        where: {
            [Op.and]: [
                { idSprint: req.params.sprintId },
                { idStory: req.params.storyId }
            ]
        }
    });
    if(!storyInCurrSprint)
        return res.status(404).json({ message: 'Invalid story ID for selected sprint' });

    if(!sprintInCurrProject.isActive())
        return res.status(400).json({ 'message': `Cannot update task for story in inactive sprint (starts ${foundSprint.startDate.toISOString()})` });
    
    let foundStory = await Story.findByPk(req.params.storyId, {
        where: { isDeleted: false }
    });
    if(foundStory.isAccepted)
        return res.status(400).json({ message: 'Cannot change tasks on a finished story' });
        
    let currentTask = await Task.findByPk(req.params.taskId);
    if(!currentTask)
        return res.status(404).json({ 'message': 'Invalid task ID' });

    let tasksForCurrentStory = await Task.findAll({
        where: { idSprintStory: storyInCurrSprint.id },
        attributes: ['id', 'isReady']
    });

    const body = req.body;

    if(body.userConfirmed && req.payload.id != currentTask.idAssignedUser)
        return res.status(401).json({ message: 'Only the assigned user can accept the assignment to the task'});
    
    if(body.isActive && req.payload.id != currentTask.idAssignedUser)
        return res.status(401).json({ message: 'Only the assigned user can set task as active' });
    
    if(body.isReady && req.payload.id != currentTask.idAssignedUser)
        return res.status(401).json({ message: 'Only the assigned user can mark the task as ready'});

    if(body.isReady && !currentTask.userConfirmed)
        return res.status(400).json({ message: 'Cannot mark an unaccepted task as ready' });
    
    if(body.isReady && currentTask.idAssignedUser === null)
        return res.status(400).json({ message: 'Cannot mark an unassigned task as ready' });

    if(body.description)
        currentTask.description = body.description;
    
    if(body.timeEstimateHrs)
        currentTask.timeEstimateHrs = body.timeEstimateHrs;

    if(body.isActive !== undefined) {
        let otherTasksForUser = await Task.findAll({
            where: {
                idAssignedUser: reqUser.id,
                isActive: true
            }
        });

        if(body.isActive && otherTasksForUser.length > 0) {
            return res.status(400).json({ message: 'Cannot have more than one active task at once per user' });
        }

        currentTask.isActive = body.isActive;
    }
    
    // Note: only allow confirming assignment, cannot withdraw it without reassigning the task
    if(body.userConfirmed)
        currentTask.userConfirmed = body.userConfirmed;
    
    if(body.isReady !== undefined)
        currentTask.isReady = body.isReady;
    
    // mark story as ready if all tasks are ready, taking into account updated readiness of current task
    let isStoryReady = tasksForCurrentStory.every(task => task.id == req.params.taskId? currentTask.isReady: task.isReady);
    storyInCurrSprint.isReady = isStoryReady;
        
    // unassign current user
    if(body.idAssignedUser === null) {
        currentTask.idAssignedUser = null;
        currentTask.userConfirmed = false;
    }
    // task is reassigned to someone else, require reconfirmation from that user
    else if(body.idAssignedUser !== undefined && body.idAssignedUser != currentTask.idAssignedUser) {
        let foundUser = await User.findByPk(body.idAssignedUser);
        if(!foundUser)
            return res.status(400).json({ message: 'Assigned user does not exist' });
        
        const isInProject = foundProject.idScrumMaster == foundUser.id || foundProject.users.find(u => u.id == foundUser.id);
        if(!isInProject)
            return res.status(400).json({ message: 'Assigned user does not belong to project' });
        
        currentTask.idAssignedUser = body.idAssignedUser;
        currentTask.userConfirmed = false;
    }

    try {
        await currentTask.save();
        await storyInCurrSprint.save();
        let refetchedTask = await Task.findByPk(currentTask.id, {
            include: [
                { model: User, as: 'assignedUser', required: false, attributes: ['id', 'username'] }
            ],
            attributes: { exclude: ['idAssignedUser'] }
        });
        return res.status(200).json(refetchedTask);
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let multipleStoryTasks = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: []} }
        ]
    });
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: 'Only an admin, product owner, scrum master or user can view tasks of this story!' });

    let sprintInCurrProject = await Sprint.findOne({
        where: {
            [Op.and]: [
                { id: req.params.sprintId },
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        }
    });
    if(!sprintInCurrProject)
        return res.status(404).json({ message: 'Invalid sprint ID for selected project' });

    let storyInCurrSprint = await SprintStory.findOne({
        where: {
            [Op.and]: [
                { idSprint: req.params.sprintId },
                { idStory: req.params.storyId }
            ]
        }
    });
    if(!storyInCurrSprint)
        return res.status(404).json({ message: 'Invalid story ID for selected sprint' });

    let foundTasks = await Task.findAll({
        where: { idSprintStory: storyInCurrSprint.id },
        include: [
            { model: User, as: 'assignedUser', required: false, attributes: ['id', 'username'] }
        ],
        attributes: { exclude: ['idAssignedUser'] }
    });

    if(foundTasks.length == 0)
        return res.status(404).json({});
    
    return res.status(200).json(foundTasks);
}

let trackTaskTime = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
        ]
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: "Unauthorized to track work done for this task" });
    
    let foundTask = await Task.findByPk(req.params.taskId);
    if(!foundTask)
        return res.status(404).json({ 'message': 'Invalid task ID' });

    if(foundTask.isReady)
        return res.status(400).json({ 'mesage': 'Cannot track time task marked as ready' });

    if(foundTask.idAssignedUser != reqUser.id || !foundTask.userConfirmed)
        return res.status(400).json({ 'message': 'Cannot track time for this task because the user is not assigned to it' });

    let currDateStart = new Date();
    currDateStart.setHours(0, 0, 0, 0);
    let currDateEnd = new Date();
    currDateEnd.setHours(23, 59, 59, 59);

    let existingWorkToday = await TaskWork.findOne({
        where: {
            [Op.and]: [
                { idUser: reqUser.id },
                { idTask: foundTask.id },
                { date: { [Op.gte]: currDateStart } },
                { date: { [Op.lte]: currDateEnd } }
            ]
        }
    });

    if(existingWorkToday) {
        // add current work to work that was already done today
        if(req.body.workDoneHrs && isFinite(req.body.workDoneHrs) && req.body.workDoneHrs > 0)
            existingWorkToday.workDoneHrs += req.body.workDoneHrs;
        else
            return res.status(400).json({ message: "'workDoneHrs' is required and needs to be a positive number" });
        
        try {
            await existingWorkToday.save();
            return res.status(200).json(existingWorkToday);
        }
        catch (err) {
            return res.status(400).json({
                messages: err.message.split(",").map(s => s.trim())
            });
        }
    }
    else {
        try {
            let newWorkDone = await TaskWork.create({
                idUser: parseInt(reqUser.id),
                idTask: parseInt(req.params.taskId),
                workDoneHrs: req.body.workDoneHrs,
                date: currDateStart
            });
            return res.status(200).json(newWorkDone);
        }
        catch (err) {
            return res.status(400).json({
                messages: err.message.split(",").map(s => s.trim())
            });
        }
    }
}

let allTaskWork = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
        ]
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });
    
    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.idProductOwner == req.payload.id;
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: "User is unauthorized to view the work done for this task" });

    let allWork = await TaskWork.findAll({
        where: { idTask: req.params.taskId },
        include: [
            { model: User, as: 'user', required: true, attributes: ['id', 'username'] }
        ],
        attributes: { exclude: ['idTask'] }
    });
    if(allWork.length === 0)
        return res.status(404).json({});

    return res.status(200).json(allWork);
}

module.exports = {
    single,
    multiple,
    create,
    update,
    remove,
    updateSprintStory,
    addStoryTask,
    updateStoryTask,
    multipleStoryTasks,
    trackTaskTime,
    allTaskWork
}