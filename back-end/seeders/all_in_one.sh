sequelize db:migrate
sequelize db:seed:all
node seeders/manual-create-projects.js
node seeders/manual-create-stories.js
node seeders/manual-create-sprints.js
node seeders/manual-create-sprint-stories.js
node seeders/create_su.js