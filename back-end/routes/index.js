var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
const rateLimit = require("express-rate-limit");

let userController = require('../controllers/user.js');
let projectController = require('../controllers/project.js');
let storyController = require('../controllers/story.js');
let sprintController = require('../controllers/sprint.js');

if(!process.env.JWT_SECRET)
  console.error("**Please set the environment variable JWT_SECRET to enable JWT generation**");
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

// Note: intentionally generic errors so that malicious user does not get additional information when they make a correct 'guess'
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {'message': 'Wrong username or password'},
  statusCode: 400,
  headers: false
});

const resetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { 'message': 'Request failed' },
  statusCode: 400,
  headers: false
});

// TODO: API paths need to be redesigned (max 2-3 levels of depth)
router.route('/user')
  .get(auth, userController.multiple);
router.route('/user/:userId')
  .get(auth, userController.single)
  .put(auth, userController.update)
  .delete(auth, userController.remove);

router.route('/project')
  .get(auth, projectController.multiple)
  .post(auth, projectController.create);

router.route('/project/:projectId')
  .get(auth, projectController.single)
  .put(auth, projectController.update)
  .delete(auth, projectController.remove);

router.route('/project/:projectId/comment')
  .get(auth, projectController.multipleComments)
  .post(auth, projectController.createComment);

router.route('/project/:projectId/comment/:commentId')
  .put(auth, projectController.updateComment)
  .delete(auth, projectController.deleteComment);

router.route('/project/:projectId/user/:userId')
  .post(auth, projectController.addProjectUser)
  .delete(auth, projectController.removeProjectUser);

router.route('/project/:projectId/story')
  .get(auth, storyController.multiple)
  .post(auth, storyController.create);

router.route('/project/:projectId/story/:storyId')
  .get(auth, storyController.single)
  .put(auth, storyController.update)
  .delete(auth, storyController.remove);

router.route('/project/:projectId/sprint/')
  .get(auth, sprintController.multiple)
  .post(auth, sprintController.create);

router.route('/project/:projectId/sprint/:sprintId')
  .get(auth, sprintController.single)
  .put(auth, sprintController.update)
  .delete(auth, sprintController.remove);

router.route('/project/:projectId/sprint/:sprintId/story')
  .put(auth, sprintController.addSprintStories);

router.route('/project/:projectId/sprint/:sprintId/story/:storyId')
  .put(auth, storyController.updateSprintStory);

router.route('/project/:projectId/sprint/:sprintId/story/:storyId/task')
  .get(auth, storyController.multipleStoryTasks)
  .post(auth, storyController.addStoryTask);

router.route('/project/:projectId/sprint/:sprintId/story/:storyId/task/:taskId')
  .put(auth, storyController.updateStoryTask);

router.route('/project/:projectId/sprint/:sprintId/story/:storyId/task/:taskId/log')
  .get(auth, storyController.allTaskWork)
  .post(auth, storyController.trackTaskTime);

router.post('/login', loginLimiter, userController.login);
router.post('/register', auth, userController.register);
router.post('/reset', resetLimiter, userController.requestResetToken);
router.post('/reset/:token', resetLimiter, userController.resetPassword);

module.exports = router;
