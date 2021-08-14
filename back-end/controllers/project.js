let { User, Project, WallComment } = require('../models');
const Op = require('sequelize').Op;


let single = async function(req, res, next) {
    let foundProject = await Project.findByPk(req.params.projectId, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id', 'username'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id', 'username'] },
            { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
        ],
        attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
    });

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    const isProductOwner = foundProject.productOwner.id == req.payload.id;
    const isScrumMaster = foundProject.scrumMaster.id == req.payload.id;
    const isUser = foundProject.users.find(u => u.id == req.payload.id);
    if(!isAdmin && !isProductOwner && !isScrumMaster && !isUser)
        return res.status(401).json({ message: "Current user is unauthorized to view this project" });

    return res.status(200).json(foundProject);
}

let multiple = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';

    let foundProjects;
    if(isAdmin) {
        foundProjects = await Project.findAll({
            include: [
                { model: User, as: 'productOwner', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'scrumMaster', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
            ],
            attributes: { exclude: ['idProductOwner', 'idScrumMaster'] },
            order: [ ['id', 'ASC'] ]
        });
    }
    else {
        // the first query only returns the logged in user as the project member, so refetch the relevant projects to obtain all members
        foundProjects = await Project.findAll({
            where: {
                [Op.or]: [
                    { 'idProductOwner': req.payload.id },
                    { 'idScrumMaster': req.payload.id },
                    { '$users.id$': req.payload.id } 
                ]
            },
            include: [{ model: User, as: 'users', required: false, through: { attributes: []} }],
        });
        let usersProjects = foundProjects.map(proj => proj.id);
        foundProjects = await Project.findAll({
            where: { id: usersProjects },
            include: [
                { model: User, as: 'productOwner', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'scrumMaster', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
            ],
            attributes: { exclude: ['idProductOwner', 'idScrumMaster'] },
            order: [ ['id', 'ASC'] ]
        });
    }

    if(foundProjects.length == 0)
        return res.status(404).json({});

    return res.status(200).json(foundProjects);
}

let create = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    if(!isAdmin) {
        return res.status(401).json({
            message: "Only an admin can create a project"
        });
    }

    const body = req.body;
    let createdProject;
    try {
        createdProject = await Project.create({
            name: body.name,
            description: body.description,
            idProductOwner: body.idProductOwner,
            idScrumMaster: body.idScrumMaster
        });
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }

    // TODO: if there's an error with connecting users, the project needs to be destroyed as well! (see transactions in sequelize)
    // if users are specified, connect them to created project
    if(body.users) {
        let processedUsers = new Set();
        for(let userObj of body.users) {
            if(processedUsers.has(userObj.id))
                continue;
            
            let currUser = await User.findByPk(userObj.id);
            processedUsers.add(userObj.id);
            if(!currUser) {
                console.warn(`**Ignoring user {id: ${userObj.id}} as it does not exist**`);
                continue;
            }

            await createdProject.addUser(currUser);
        }
    }

    // refetch project from database to return the same structure independent of request
    let refetchedProject = await Project.findByPk(createdProject.id, {
        include: [
            { model: User, as: 'productOwner', required: true, attributes: ['id', 'username'] },
            { model: User, as: 'scrumMaster', required: true, attributes: ['id', 'username'] },
            { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
        ],
        attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
    });
    return res.status(201).json(refetchedProject);
}

let update = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId);
    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    const body = req.body;

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    // admin can update any project, scrum master can update their project
    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: "Only an admin or user with role 'skrbnik metodologije' can update this project!" });
    
    if(body.name)
        foundProject.name = body.name;
    
    if(body.description)
        foundProject.description = body.description;
    
    if(body.idProductOwner)
        foundProject.idProductOwner = body.idProductOwner;

    if(body.idScrumMaster)
        foundProject.idScrumMaster = body.idScrumMaster;

    try {
        await foundProject.save();
        // refetch the project with the resolved data
        foundProject = await Project.findByPk(req.params.projectId, {
            include: [
                { model: User, as: 'productOwner', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'scrumMaster', required: true, attributes: ['id', 'username'] },
                { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} }
            ],
            attributes: { exclude: ['idProductOwner', 'idScrumMaster'] }
        });
        return res.status(200).json(foundProject);
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let remove = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId);
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;
    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: "Only an admin or user with role 'skrbnik metodologije' can delete this project!" });

    try {
        await foundProject.destroy();
        return res.status(200).json({});
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({});
    }
}

let addProjectUser = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId);

    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;

    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: "Only an admin or user with role 'skrbnik metodologije' can modify users on project!" });
   
    let currUser = await User.findByPk(req.params.userId);
    if(!currUser)
        return res.status(404).json({ 'message': 'Invalid user ID' });

    try {
        await foundProject.addUser(currUser);
        return res.status(200).json({});
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({});
    }
}
 
let removeProjectUser = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId);
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    const isScrumMaster = foundProject.idScrumMaster == req.payload.id;

    if(!isAdmin && !isScrumMaster)
        return res.status(401).json({ message: "Only an admin or user with role 'skrbnik metodologije' can modify users on project!" });

    let currUser = await User.findByPk(req.params.userId);
    if(!currUser)
        return res.status(404).json({ 'message': 'Invalid user ID' });
    
    try {
        // Note: returns 200 even if deleting an existing user from a project they don't belong to
        await foundProject.removeUser(currUser);
        return res.status(200).json({});
    }
    catch(err) {
        console.error(err);
        return res.status(500).json({});
    }
}

let multipleComments = async function(req, res, next) {
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
        return res.status(400).json({ 'message': 'Only an admin, product owner, scrum master or user can view project comments!' });

    let foundComments = await WallComment.findAll({
        where: {
            isDeleted: false
        },
        include: [
            { model: User, as: 'user', required: true, attributes: ['id', 'username'] }
        ],
        attributes: { exclude: ['idProject', 'idUser'] }
    });
    if(foundComments.length == 0)
        return res.status(404).json({});

    return res.status(200).json(foundComments);
}

let createComment = async function(req, res, next) {
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
        return res.status(400).json({ 'message': 'Only an admin, product owner, scrum master or user can create a project comment!' });

    try {
        let createdComment = await WallComment.create({
            comment: req.body.comment,
            idUser: parseInt(req.payload.id),
            idProject: parseInt(req.params.projectId)
        });
        return res.status(201).json(createdComment);
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let updateComment = async function(req, res, next) {
    let foundProject = await Project.findByPk(req.params.projectId, { 
        include: [ 
            { model: User, as: 'users', required: false, attributes: ['id', 'username'], through: { attributes: []} } 
        ]
    });
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });
    
    let foundComment = await WallComment.findByPk(req.params.commentId, {
        where: { isDeleted: false }
    });

    if(!foundComment)
        return res.status(404).json({ 'message': 'Invalid comment ID' });

    if(foundComment.idUser != req.payload.id)
        return res.status(400).json({ 'message': 'Only the user who posted the comment can edit it!' });

    if(req.body.comment !== undefined)
        foundComment.comment = req.body.comment;

    try {
        let updatedComment = await foundComment.save();
        return res.status(200).json(updatedComment);
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}


let deleteComment = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    let foundProject = await Project.findByPk(req.params.projectId, {});
    if(!foundProject)
        return res.status(404).json({ 'message': 'Invalid project ID' });

    let foundComment = await WallComment.findByPk(req.params.commentId, {
        where: { isDeleted: false }
    });
    if(!foundComment)
        return res.status(404).json({ 'message': 'Invalid comment ID' });

    const isAdmin = reqUser.globalRole === 'admin';
    if(!isAdmin && foundComment.idUser != req.payload.id)
        return res.status(400).json({ 'message': 'Only an admin or the user who created the comment can delete the comment!' });

    try {
        foundComment.isDeleted = true;
        await foundComment.save();
        return res.status(200).json({});
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

module.exports = {
    single,
    multiple,
    create,
    update,
    remove,
    addProjectUser,
    removeProjectUser,
    multipleComments,
    createComment,
    updateComment,
    updateComment,
    deleteComment
};