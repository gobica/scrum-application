# Temporary docs for projects (backend)
**IMPORTANT: local roles were removed as there is now a specific field for specifying product owner and scrum master!**

1. Endpoint for creating a project (admin only). Note that you can either **(1.)** create a project and later add users to it one by one (see below) or **(2.)** create a project with specified users. The following example shows option (2.). If you prefer option (1.), skip the `users` field in the request body.  
Call: `POST /api/project/`  
Required fields: `name` (string), `idProductOwner` (integer), `idScrumMaster` (integer).  
Optional fields: `description` (string), `users` (array of user JSONs, containing `id` (integer)).  
Example body of request:  
```json
{
    "name": "SMRPO5",
    "description": "SMRPO projekt za skupino 5",
    "idProductOwner": 1,
    "idScrumMaster": 3,
    "users": [
    	{ "id": 2 },
    	{ "id": 3 }
    ]
}
```  

2. Endpoints for updating and deleting a project (admin and scrum master only). **IMPORTANT: changing a product owner and scrum master is only possible via updating the project (i.e. the PUT method below).**
Calls: `PUT /api/project/<projectId>` (update), `DELETE /api/project/<projectId>`  
Optional fields for PUT: `name` (string), `description` (string), `idProductOwner` (integer), `idScrumMaster` (integer).  
Example body of request for updating a project and its product owner and scrum master:  
```json
{
	"name": "Skupina5",
    "idProductOwner": 3,
    "idScrumMaster": 1
}
```

3. Endpoint for adding a user to project.  
Call: `POST /api/project/<projectId>/user/<userId>`  
Example body of request: / (empty)

4. Endpoint for deleting a user from project.  
Call: `DELETE /api/project/<projectId>/user/<userId>`  


