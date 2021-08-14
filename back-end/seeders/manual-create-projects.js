require('dotenv').config();
let { User, Project } = require('../models');

let createProject = async function(projectObj) {
    try {
        let productOwner = await User.findOne({ where: { username: projectObj.productOwner } });
        let scrumMaster = await User.findOne({ where: { username: projectObj.scrumMaster } });

        let createdProject = await Project.create({
            name: projectObj.name,
            description: projectObj.description,
            idProductOwner: productOwner.id,
            idScrumMaster: scrumMaster.id 
        });

        for(let projUser of projectObj.users) {
            let currUser = await User.findOne({ where: { username: projUser } });
            await createdProject.addUser(currUser);
        }
    }
    catch(err) {
        console.error(err);
    }
}

let projects = [
    {
        name: 'Projekt skupine 5',
        description: 'Razvoj sistema za podporo metodi Scrum.',
        productOwner: 'sally',
        scrumMaster: 'jack',
        users: ['jack', 'donna', 'jdoe', 'apond', 'wilfred', 'harold']
    },
    {
        name: 'Drugi tir',
        description: '',
        productOwner: 'jack',
        scrumMaster: 'donna',
        users: ['donna', 'jdoe']
    },
    {
        name: 'Manhattan project',
        description: 'Definitely not developing nuclear weapons',
        productOwner: 'donna',
        scrumMaster: 'sally',
        users: []
    },
    {
        name: 'Half-Life 4',
        description: '',
        productOwner: 'charper',
        scrumMaster: 'alan',
        users: ['rosa', 'carlton']
    }
];

(async () => {
    try {
        for(let currProj of projects) {
            console.log(`"**Creating project ${currProj.name}**`);
            await createProject(currProj);
        }
    } 
    catch(err) {
        console.log("**FAILED**");
        console.error(err);
    }
})();