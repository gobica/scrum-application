let { User, Project, Sprint, Story, SprintStory, sequelize } = require('../models');
const { Op } = require('sequelize');

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
        return res.status(401).json({ message: 'Only an admin, product owner, scrum master or project member can view this sprint!' });
    
    let foundSprint = await Sprint.findOne({
        where: {
            [Op.and]: [
                { 'idProject': req.params.projectId },
                { 'id': req.params.sprintId },
                { 'isDeleted': false } 
            ]
        },
        include: [
            { model: Story, as: 'stories', required: false, through: { attributes: ['id', 'isReady', 'isAccepted', 'reviewComment' ] } }
        ],
        attributes: { exclude: ['idProject'] }
    });

    if(!foundSprint)
        return res.status(404).json({ 'message': 'Invalid sprint ID' });

    return res.status(200).json(foundSprint);
}

let multiple = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id'] },
            { model: User, as: 'users', required: false, attributes: ['id'], through: { attributes: [] } }
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
        return res.status(401).json({ message: 'Only an admin, product owner, scrum master or project member can view project\'s sprints!' });
    
    let foundSprints = await Sprint.findAll({
        where: { 
            [Op.and]: [
                { idProject: req.params.projectId },
                { isDeleted: false }
            ]
        },
        include: [
            { model: Story, as: 'stories', required: false, through: { attributes: ['id', 'isReady', 'isAccepted', 'reviewComment' ] } }
        ],
        attributes: { exclude: ['idProject'] }
    });

    if(foundSprints.length === 0)
        return res.status(404).json({});
    
    return res.status(200).json(foundSprints);
}

let create = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'scrumMaster', required: true, attributes: ['id'] }
        ],
        attributes: { exclude: ['idScrumMaster'] }
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.scrumMaster.id == req.payload.id;
    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: 'Only an admin or scrum master can add a new sprint!' });
    
    const body = req.body;
    try {
        let createdSprint = await Sprint.create({
            startDate: body.startDate,
            endDate: body.endDate,
            velocity: body.velocity,
            idProject: foundProject.id
        });
        delete createdSprint.dataValues.createdAt;
        delete createdSprint.dataValues.updatedAt;
        delete createdSprint.dataValues.idProject;
        return res.status(201).json(createdSprint);
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

// NOTE: this method does not support changing the project, to which a sprint belongs -
// to do that, you first have to delete a sprint and then create it again
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
    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: 'Only an admin or scrum master can update a sprint!' });
    
    const body = req.body;
    let foundSprint = await Sprint.findOne({
        where: {
            [Op.and]: [
                { 'idProject': req.params.projectId },
                { 'id': req.params.sprintId },
                { 'isDeleted': false }
            ]
        },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if(!foundSprint)
        return res.status(404).json({ 'message': 'Invalid sprint ID' });
    
    const currDate = new Date();
    if(foundSprint.isActive()) {
        let storiesInSprint = await SprintStory.findAll({
            where: { idSprint: foundSprint.id },
            include: [
                { model: Story, as: 'story', required: true }
            ]
        });
        let ptsInSprint = storiesInSprint.reduce((ptsCounted, currSprintStory) => (ptsCounted + currSprintStory.story.sizePts), 0);
        if(body.velocity !== undefined && body.velocity < ptsInSprint)
            return res.status(400).json({ 'message': `Cannot set velocity below sum of story complexities in the sprint (${ptsInSprint} pts)`})

        if(body.velocity !== undefined)
            foundSprint.velocity = body.velocity;
        
        if(body.startDate || body.endDate)
            return res.status(400).json({ 'message': 'Cannot update start and end date on sprint in progress' })
    }
    // sprints that haven't started yet can't contain stories, so no need to check that velocity > sum of complexities
    else if (foundSprint.startDate > currDate) {
        if(body.startDate)
            foundSprint.startDate = body.startDate;
    
        if(body.endDate)
            foundSprint.endDate = body.endDate;
        
        if(body.velocity !== undefined)
            foundSprint.velocity = body.velocity;
    }
    else {
        return res.status(400).json({ 'message': 'Cannot update sprints that already ended' })
    }
    
    try {
        await foundSprint.save();
        delete foundSprint.dataValues.updatedAt;
        delete foundSprint.dataValues.idProject;
        return res.status(200).json(foundSprint);
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
    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: 'Only an admin or scrum master can delete a sprint!' });

    let foundSprint = await Sprint.findOne({
        where: {
            [Op.and]: [
                { idProject: req.params.projectId },
                { id: req.params.sprintId },
                { isDeleted: false }
            ]
        }
    });

    // Note: returns 200 even if deleting a sprint from a project it doesn't exist in -
    // it is implemented this way to be consistent with deleting a user and story from project
    if(!foundSprint)
        return res.status(200).json({});
    
    const currDate = new Date();
    if(foundSprint.startDate <= currDate)
        return res.status(400).json({ 'message': 'Cannot delete a sprint that has already started' });

    foundSprint.isDeleted = true;
    try {
        await foundSprint.save();
        return res.status(200).json({});
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({});
    }
}

// Note: this either inserts all stories or none (and returns errors)
let addSprintStories = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId);
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    let foundSprint = await Sprint.findByPk(req.params.sprintId, {
        where: {
            isDeleted: false
        },
        include: [
            { model: Story, as: 'stories', required: false}
        ]
    });
    if(!foundSprint)
        return res.status(404).json({ 'message': 'Invalid sprint ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;

    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: "Only an admin or user with role 'skrbnik metodologije' can modify stories on sprint!" });
    
    let existingStories = new Set();
    let existingPoints = 0;
    foundSprint.stories.forEach(story => {
        existingStories.add(story.id);
        existingPoints += story.sizePts;
    })

    let currDate = new Date();
    if(!foundSprint.isActive())
        return res.status(400).json({ 'message': `Cannot assign stories to inactive sprint (starts ${foundSprint.startDate.toISOString()})` });
   
    let idStories = req.body.stories;
    if(!idStories && !Array.isArray(idStories))
        return res.status(400).json({ message: 'An array of stories is required' });
    
    // remove stories that may be noted twice
    idStories = Array.from(new Set(idStories));
    let allStories = await Story.findAll({
        where: { 
            [Op.and]: [
                { id: idStories },
                { isDeleted: false }
            ]
        },
        include: [
            { model: Sprint, as: 'sprints', required: false, attributes: ['id', 'startDate', 'endDate'], through: { attributes: [] } }
        ]
    });
    let errors = [];
    for(let currStory of allStories) {
        if(currStory.sizePts === null)
            errors.push(`Cannot add a story that has not had its time estimated yet (story #${currStory.id})`);
        
        if(!currStory.sizePts !== null && !existingStories.has(currStory.id))
            existingPoints += currStory.sizePts;
        
        if(currStory.isAccepted)
            errors.push(`Cannot add a story that has already been finished (story #${currStory.id})`);
        
        // allow 'overriding' stories already assigned to this sprint
        let assignedToActiveSprint = currStory.sprints.find(s => 
            s.id !== foundSprint.id &&
            (s.startDate <= currDate && s.endDate > currDate));
        if(assignedToActiveSprint)
            errors.push(`Cannot add a story that is assigned to sprint in progress (story #${currStory.id})`);
    }

    if(existingPoints > foundSprint.velocity)
        errors.push(`Cannot add stories to sprint where the sum of time complexities (${existingPoints}) would exceed sprint velocity (${foundSprint.velocity})!`);

    if(errors.length > 0)
        return res.status(400).json({ messages: errors });
    
    let t = await sequelize.transaction();
    try {
        for(let currStory of allStories)
            await foundSprint.addStory(currStory, { transaction: t });
    }
    catch(err) {
        if(t)
            await t.rollback();
        
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }

    await t.commit();
    return res.status(201).json({});
}


module.exports = {
    single,
    multiple,
    create,
    update,
    remove,
    addSprintStories
};
