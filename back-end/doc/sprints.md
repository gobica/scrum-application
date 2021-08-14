# Temporary docs for sprints (backend)
Sprints are tied to projects. They must not overlap (w.r.t. dates) with other sprints in same project.
Velocity must be above 0. Start date of a sprint must be in the future. End date must be after start date.   
**NOTE1**: Changing the project ID of a sprint is not supported. If you want to do that, delete a sprint and then create a new one with the fixed project ID.  
**NOTE2**: The assumed date format in requests is `YYYY-MM-DD hh:mm:ss`.  

1. Getting ALL the sprints of a project.  
Call: `GET /api/project/<idProject>/sprint`  

2. Getting details for a specific sprint of a project.  
Call: `GET /api/project/<idProject>/sprint/<idSprint>`  

3. Creating a new sprint in project.  
Call: `POST /api/project/<idProject>/sprint`  
Required fields: `startDate` (string), `endDate` (string), `velocity` (integer/float).  
Example body of request:  
```json
{
	"startDate": "2020-04-12",
	"endDate": "2020-04-28",
	"velocity": 10
}
```  

4. Updating a specific sprint in project. You can only update a sprint that has not started yet.  
Call: `PUT /api/project/<idProject>/sprint/<idSprint>`  
Optional fields: `startDate` (string), `endDate` (string), `velocity` (integer/float).  
Example body of request:  
```json
{
	"endDate": "2020-04-29"
}
```

5. Deleting a specific sprint. You can only delete a sprint that has not started yet.  
Call: `DELETE /api/project/<idProject>/sprint/<idSprint>`  

6. Adding stories (by story IDs) to sprint. **You can only add stories to a sprint that is currently in progress**.  
Call: `PUT /api/project/<idProject>/sprint/<idSprint>/story`  
Required fields: `stories` (array of integers)  
Example body of request:  
```json
{
	"stories": [1, 2, 3]
}
```