# Temporary docs for stories (backend)
Stories are tied to projects. Story names are unique inside same projects. Story priorities are predefined - must be one of `["must have", "could have", "should have", "won't have this time"]`.  
**NOTE1**: Changing the project ID of a story is not supported. If you want to do that, delete a story and then create a new one with the fixed project ID.  
**NOTE2**: `isAccepted` field is ignored when creating a new story as creating a finished story does not make sense.  
**NOTE3**: if `sizePts` is `null`, that means the story has no estimated size yet.  

1. Getting ALL the stories of a project.  
Call: `GET /api/project/<idProject>/sprint`  

2. Getting details for a specific story of a project.  
Call: `GET /api/project/<idProject>/story/<idSprint>`  

3. Creating a new story in project.  
Call: `POST /api/project/<idProject>/story`  
Required fields: `name` (string), `acceptanceTests` (string), `priority` (string), `businessValue` (int/float).  
Optional fields: `description` (string), `sizePts` (int/float).  
Example body of request:  
```json
{
    "name": "User login",
    "description": "User should be able to enter the system using correct credentials.",
    "acceptanceTests": "### Check with correct credentials\n### Check with wrong credentials",
    "priority": "must have",
    "businessValue": 1
}
```  

4. Updating a specific story in project.    
Call: `PUT /api/project/<idProject>/story/<idStory>`  
Optional fields: `name` (string), `acceptanceTests` (string), `priority` (string), `businessValue` (int/float), `description` (string), `sizePts` (int/float), `isAccepted` (boolean).  
Example body of request:  
```json
{
    "priority": "won't have this time"
}
```

5. Deleting a specific story.  
Call: `DELETE /api/project/<idProject>/story/<idStory>`  

6. Adding a task to story. **Note that you can only add a task to active sprint!**. If `idAssignedUser` is specified, that user must either be a scrum master or regular user on project.  
Call: `POST /api/project/<idProject>/sprint/<idSprint>/story/<idStory>/task`  
Required fields: `description` (string), `timeEstimateHrs` (int/float).  
Optional fields: `idAssignedUser` (integer).
Example body of request:
```json
{
	"description": "Create frontend for story",
	"timeEstimateHrs": 5.5,
	"idAssignedUser": 3
}
```

7. Updating a task on a story. **Note that you can only update tasks on active sprints!**. A few notes here:
- if `idAssignedUser` is changed, the `userConfirmed` flag gets reset (i.e. the task requires confirmation from newly assigned user);  
- `userConfirmed` is a flag, denoting if assignment was accepted: `true` means accepted, while `false` means WAITING (**not REJECTED**);  
- `userConfirmed` can only be set by the currently assigned user;  
- `isReady` can only be set by the currently assigned user;  
- `isReady` can only be set if the task was accepted by the assigned user.  
Call: `POST /api/project/<idProject>/sprint/<idSprint>/story/<idStory>/task/<taskId>`  
Optional fields: `description` (string), `timeEstimateHrs` (int/float), `idAssignedUser` (integer), `userConfirmed` (boolean), `isReady` (boolean).
Example body of request:
```json
{
    "userConfirmed": true
}
```

8. Getting all tasks for story. If `userConfirmed` is false and `idAssignedUser` is not null, that means the user did not yet accept the assignment.    
Call: `GET /api/project/<idProject>/sprint/<idSprint>/story/<idStory>/task`  
