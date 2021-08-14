require('dotenv').config();
let { Sprint, Story, Project } = require('../models');
const Op = require('sequelize').Op;

let createSprintStory = async function(projectObj) {
    try {
        let foundProject = await Project.findOne({
            name: projectObj.name
        });

        let foundSprint = await Sprint.findOne({
            [Op.and]: {
                idProject: foundProject.id,
                startDate: projectObj.sprintStart
            }
        });

        for(let story of projectObj.stories) {
            console.log(`Adding story '${story.name}'`);
            let currStory = await Story.findOne({ where: { name: story.name } });
            await foundSprint.addStory(currStory);
        }
    }
    catch(err) {
        console.error(err);
    }
}

let projectSprintStories = [
    {
        name: 'Projekt skupine 5',
        sprintStart: '2020-08-13T00:00:00+02:00',
        stories: [
            {
                name: 'Prijava v sistem',
                tasks: [
                    { description: 'Prilagodi bazo', timeEstimateHrs: 3.0 }
                ]
            },
            {
                name: 'Registracija uporabnika'
            }
        ]
    }
];

(async () => {
    try {
        for(let currProj of projectSprintStories) {
            console.log(`"**Creating stories for sprint in project ${currProj.name}**`);
            await createSprintStory(currProj);
        }
    } 
    catch(err) {
        console.log("**FAILED**");
        console.error(err);
    }
})();