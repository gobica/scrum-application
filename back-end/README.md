# smrpo-be
The backend (API) for a scrum tool, originally created for a software engineering class. The project needs a refactor badly; until then, it serves more as a general reference (for reusing code).

The project uses Express, Sequelize ORM and SQLite.

## Development setup
1. Move into the project's root folder.  
2. Install dependencies.  
`$ npm install`  
3. Install nodemon globally to enable automatic server reload when developing.  
`$ npm install -g nodemon`  
4. Install sequelize globally to enable the commands.  
`$ npm install -g sequelize-cli`  
5. Install sqlite3 globally to enable setting up a dev database.
`$ npm install -g sqlite3`  
5. Run migrations to set up the structure of database. After executing this command, `db.dev.sqlite` should appear in the root directory.
`$ sequelize db:migrate`
6. Create a `.env` file in the root of the project. It serves as a virtual storage of environment variables.
Inside, assign some value to the variable `JWT_SECRET` - this will be used for generating tokens for authentication.  
`JWT_SECRET=mySecret`
7. Run the project - the app will run on `localhost:3000` by default.  
`$ npm run dev`  

8. (Optional) If you want to enable mail sending, create a Yahoo account (using Yahoo because gmail requires setting up 2FA). In there, create a new password
for a custom application (otherwise Yahoo won't allow connection). Then, set the `MAIL_ADDR` and `MAIL_PASS` to the e-mail address and generated password. Mail sending only works in production environment, so make sure `NODE_ENV` is set to `production`.  

If you want to create an admin account, run `node seeders/create_su.js`. This will create an admin account with randomly generated credentials and display them. You are advised to change these to your preferences afterwards.

## List of supported environment variables
TODO: after this project is finished, list the environment variables and their purpose (+ expected values) here.

## Development guidelines
**Do not** hardcode any production-level secrets (usernames, passwords, JWT secrets etc.). Instead, put them inside environment variables.

Note that seeders break this rule, but this is just dummy data. To run seeders (from root of project):  
`$ source seeders/all_in_one.sh`

## Testing
If you want to run the tests, make sure to first follow the instructions above. Once you've set that up, you can run the tests (warning: this will destroy some things in the database).  
`$ npm test`
