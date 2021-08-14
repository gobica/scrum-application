# Temporary docs for registration/login and managing users (backend)
1. Endpoint for creating (registering) a user. **For security reasons, admin can not be created using this method**. To create an admin user, use the `create_su.js` script inside `seeders/`.  
Call: `POST /api/register/`  
Required fields: `email` (string), `password` (string), `firstName` (string), `lastName` (string).
Example body of request: 
```json
{
	"email": "john@smith.com",
	"password": "passwd1",
	"firstName": "John",
	"lastName": "Smith"
}
```
2. Endpoint for logging in. On successfull calls, the method returns a token, which is used in the header field `Authorization` of further requests to the API. More specifically, the `Authorization` header should be in the format `Bearer <token>`.
Required fields: `email` (string), `password` (string).
Example body of request:
```json
{
	"email": "john@smith.com",
	"password": "passwd1"
}
```
3. After creating a user and logging in, it is possible to obtain details of one (`GET /api/user/<userId>`) or all users (`GET /api/user`), update (`PUT /api/user/<userId>`) or delete (`DELETE /api/user/<userId>`) a user.  
Make sure that the `Authorization` header is set when making any of these calls.  
**IMPORTANT:** API calls that access other users are protected. For example, a user can only see their own details or update their own details. Only an admin can freely poke around all the data.