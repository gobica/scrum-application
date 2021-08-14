require('dotenv').config();
let { Sprint, Project } = require('../models');

let createProjectSprint = async function(projectSprintObj) {
    try {
        let foundProject = await Project.findOne({where: {
            name: projectSprintObj.name
        }});

        for(let sprint of projectSprintObj.sprints) {
            try {
                await Sprint.create({
                    startDate: sprint.startDate,
                    endDate: sprint.endDate,
                    velocity: sprint.velocity,
                    idProject: foundProject.id
                });
            }
            catch(err) {
                console.error(err);
            }
        }
    }
    catch(err) {
        console.error(err);
    }
}

let projects = [
    {
        name: 'Projekt skupine 5',
        sprints: [
            {
                startDate: '2020-08-13T00:00:00+02:00',
                endDate: '2020-08-27T00:00:00+02:00',
                velocity: 12.0
            },
            {
                startDate: '2020-09-01T00:00:00+02:00',
                endDate: '2020-09-25T00:00:00+02:00',
                velocity: 20.0
            },
            {
                startDate: '2020-10-01T00:00:00+02:00',
                endDate: '2020-10-10T00:00:00+02:00',
                velocity: 10.0
            }
        ]
    },
    {
        name: 'Drugi tir',
        sprints: [
            {
                startDate: '2020-06-01T00:00:00+02:00',
                endDate: '2045-06-01T00:00:00+02:00',
                velocity: 10.0
            }
        ]
    },
    {
        name: 'Half-Life 4',
        sprints: [
            {
                startDate: '2022-01-01T00:00:00+02:00', 
                endDate: '2022-01-18T00:00:00+02:00', 
                velocity: 30
            },
            {
                startDate: '2022-01-20T00:00:00+02:00',
                endDate: '2022-02-05T00:00:00+02:00',
                velocity: 32
            },
            {
                startDate: '2022-02-10T00:00:00+02:00',
                endDate: '2022-02-24T00:00:00+02:00',
                velocity: 28
            },
            {
                startDate: '2022-02-26T00:00:00+02:00',
                endDate: '2022-03-13T00:00:00+02:00',
                velocity: 29
            },
            {
                startDate: '2022-03-15T00:00:00+02:00',
                endDate: '2022-04-01T00:00:00+02:00',
                velocity: 33
            },
            {
                startDate: '2022-04-02T00:00:00+02:00',
                endDate: '2022-04-25T00:00:00+02:00',
                velocity: 46
            },
            {
                startDate: '2022-04-27T00:00:00+02:00',
                endDate: '2022-06-01T00:00:00+02:00',
                velocity: 75
            }
        ]
    }
];

(async () => {
    try {
        for(let currProj of projects) {
            console.log(`"**Creating sprints for project ${currProj.name}**`);
            await createProjectSprint(currProj);
        }
    } 
    catch(err) {
        console.log("**FAILED**");
        console.error(err);
    }
})();