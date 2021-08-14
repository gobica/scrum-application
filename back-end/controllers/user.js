let { User, ResetRequest } = require('../models');
let { nanoid } = require('nanoid');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const RESET_TOKEN_VALIDITY = 60; // in min
const MAX_OPEN_REQUESTS = 5;
const MAX_REQUESTS_PER_DAY = process.env.MAX_REQUESTS_PER_DAY || 1000;
const RESET_TOKEN_LENGTH = 48;
const FRONTEND_LINK = process.env.FRONTEND_LINK || 'http://localhost:4200';

let transporter;
if(process.env.MAIL_ADDR && process.env.MAIL_PASS)
    transporter = nodemailer.createTransport({
        pool: true,
        host: "smtp.mail.yahoo.com",
        service: "yahoo",
        port: 465,
        secure: false,
        auth: {
            user: process.env.MAIL_ADDR,
            pass: process.env.MAIL_PASS
        }
    });

let multiple = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    
    let includeDeleted = req.query.includeDeleted || false;
    includeDeleted = includeDeleted === 'true';
    if([true, false].indexOf(includeDeleted) === -1)
        return res.status(400).json({ message: '\'includeDeleted\' query parameter must be one of {true, false}' })
    
    if(!isAdmin && includeDeleted !== false)
        return res.status(401).json({ message: 'Only an admin can view the deleted users' });

    let whereStmt = {};
    if(includeDeleted === false)
        whereStmt.isDeleted = false;

    // don't show all user details to non-admins
    let foundUsers = await User.scope(isAdmin? 'defaultScope': 'publicDetails').findAll({
        where: whereStmt,
        order: [
            ['isDeleted', 'ASC'],
            ['lastName', 'ASC'],
            ['firstName', 'ASC']
        ]
    });
    if(foundUsers.length == 0)
        return res.status(404).json({});
    
    return res.status(200).json(foundUsers);
};

let single = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    if(!isAdmin && req.params.userId != req.payload.id) {
        return res.status(401).json({ message: 'Users can only view their own details' });
    }

    let foundUser = await User.findByPk(req.params.userId);

    if(!foundUser)
        return res.status(404).json({ 'message': 'Invalid user ID' });
    
    return res.status(200).json(foundUser);
};

let remove = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    if(!isAdmin)
        return res.status(401).json({ message: 'Only an admin can delete users' });

    let foundUser = await User.findByPk(req.params.userId);
    if(!foundUser)
        return res.status(404).json({ 'message': 'Invalid user ID' });

    foundUser.isDeleted = !foundUser.isDeleted;
    try {
        await foundUser.save();
        return res.status(200).json({});
    }
    catch(err) {        
        console.error(err);
        return res.status(500).json({});
    }
}

let update = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    const updatingSelf = reqUser.id == req.params.userId;
    if(!isAdmin && !updatingSelf) {
        return res.status(401).json({ message: "Only an admin can update other users' details" });
    }

    const body = req.body;
    let foundUser = await User.findByPk(req.params.userId);

    if(!foundUser)
        return res.status(404).json({ 'message': 'Invalid user ID' });
    
    if(body.username)
        foundUser.username = body.username;
    if(body.email)
        foundUser.email = body.email;
    if(body.firstName)
        foundUser.firstName = body.firstName;
    if(body.lastName)
        foundUser.lastName = body.lastName;
    if(body.password)
        foundUser.password = body.password;
    // only admin can change global role, otherwise role stays the same
    if(body.globalRole && isAdmin)
        foundUser.globalRole = body.globalRole;
    
    try {
        await foundUser.save();
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
    let userWithoutPass = foundUser.dataValues;
    delete userWithoutPass.password;
    return res.status(200).json(userWithoutPass);
}

let register = async function(req, res, next) {
    let reqUser = await User.findByPk(req.payload.id);
    const isAdmin = reqUser.globalRole === 'admin';
    if(!isAdmin) {
        return res.status(401).json({ message: 'Only an admin can create users' });
    }

    const body = req.body;
    try {
        let insertedInstance = await User.create({
            username: body.username,
            email: body.email,
            password: body.password,
            globalRole: body.globalRole || 'user',
            firstName: body.firstName,
            lastName: body.lastName
        });
        // NOTE: sequelize does not support hiding fields after insertion, so do it manually
        let userWithoutPass = insertedInstance.dataValues;
        delete userWithoutPass.password;
        return res.status(201).json(userWithoutPass);
    }
    catch(err) {
        return res.status(400).json({
            messages: err.message.split(",").map(s => s.trim())
        });
    }
}

let login = async function(req, res, next) {
    try {
        const token = await User.authenticate(req.body.username, req.body.password);
        return res.status(200).json({ token });
    }
    catch(err) {
        return res.status(400).json({ message: 'Wrong username or password' });
    }
}

let requestResetToken = async function(req, res, next) {
    let userMail = req.body.email;
    if(!userMail)
        return res.status(400).json({ message: 'Please enter your e-mail address' });

    userMail = userMail.toLowerCase();
    if(!isValidMail(userMail))
        return res.status(400).json({ message: 'Invalid e-mail address format' });
    
    const foundUser = await User.findOne({
        where: { email: userMail }
    });

    // generic response if requesting reset for non-existing user
    if(!foundUser)
        return res.status(200).json({ message: 'If an account with that e-mail address exists, a message with further information on resetting the password should be available in the inbox soon' });
    
    let currDate = new Date();
    let numOpenRequests = await ResetRequest.count({
        where: {
            [Op.and]: [
                { idUser: foundUser.id },
                { validUntil: { [Op.gte]: currDate } },
                { isUsed: false }
            ]
        }
    });

    console.log(`There are ${numOpenRequests} open requests for user ${foundUser.email}`);
    // generic response if requesting reset too many times
    if(numOpenRequests >= MAX_OPEN_REQUESTS) {
        console.log(`User has too many open & unused reset requests (${MAX_OPEN_REQUESTS})`);
        return res.status(200).json({ message: 'If an account with that e-mail address exists, a message with further information on resetting the password should be available in the inbox soon' });
    }

    // Failsafe: limit amount of total mails being sent per day
    let currDateMidnight = new Date();
    currDateMidnight.setHours(0,0,0,0);
    let numRequestsToday = await ResetRequest.count({
        where: { validUntil: { [Op.gte]: currDateMidnight } }
    });

    console.log(`There are ${numRequestsToday} open requests today so far`);
    if(numRequestsToday > MAX_REQUESTS_PER_DAY) {
        console.log(`Exceeded max number of e-mails sent in a day (${MAX_REQUESTS_PER_DAY})`);
        return res.status(200).json({ message: 'If an account with that e-mail address exists, a message with further information on resetting the password should be available in the inbox soon' });
    }
    
    let token = nanoid(RESET_TOKEN_LENGTH);
    let expDate = new Date(currDate.getTime() + RESET_TOKEN_VALIDITY * 60 * 1000);
    try {
        await ResetRequest.create({
            stringToken: token,
            issued: currDate,
            validUntil: expDate,
            idUser: foundUser.id
        });
        let resetLink = `${FRONTEND_LINK}/reset/${token}`;
        if(process.env.NODE_ENV === 'production')
            await sendMail(foundUser.email, '[smrpo5] Password reset request', `<html>${foundUser.username}, <br /> a password reset was requested for your account. To reset your password, follow the link, provided below. If you did not request this, you can safely delete this message. <br /> ${resetLink}</html>`);
    }
    catch(err) {
        console.error(err);
    }

    return res.status(200).json({ message: 'If an account with that e-mail address exists, a message with further information on resetting the password should be available in the inbox soon' });
}

let resetPassword = async function(req, res, next) {
    const resetToken = req.params.token;
    let foundToken = await ResetRequest.findOne({
        where: {
            [Op.and]: [
                { stringToken: resetToken },
                { validUntil: { [Op.gte]: new Date() } },
                { isUsed: false}
            ]
        }
    });

    const newPassword = req.body.password;
    if(!foundToken || !newPassword)
        return res.status(400).json({ message: 'Request failed' });
        
    let foundUser = await User.findByPk(foundToken.idUser);
    foundUser.password = newPassword;
    // TODO: these 2 saves should be in a transaction
    try {
        await foundUser.save();
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({ message: 'Request failed' });
    }

    foundToken.isUsed = true;
    try {
        await foundToken.save();
    }
    catch(err) {
        console.error(err);
        return res.status(400).json({ message: 'Request failed' });
    }

    console.log(`Successfully performed reset for user ${foundUser.id}`);
    return res.status(200).json({ message: 'Successfully reset password!' });
}


async function sendMail(mail, subject, body) {
    if(!isValidMail(mail))
        throw new Error(`Invalid e-mail address: ${mail}`);
    
    try {
        let info = await transporter.sendMail({
            from: process.env.MAIL_ADDR,
            to: mail,
            subject: subject,
            html: body
        });
        console.log(`Message sent: ${info.messageId}`);
    }
    catch(err) {
        console.error("Sending email failed...");
        console.error(err);
    }
}

function isValidMail(email) {
    // https://stackoverflow.com/a/46181
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (email.length <= 100) && re.test(email);
}

module.exports = {
    multiple,
    single,
    register,
    requestResetToken,
    resetPassword,
    login,
    remove,
    update
};