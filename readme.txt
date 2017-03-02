Code to solve the following use case->

There are 3 models in the system
=================================
1. User
2. Roles
3. Permissions

User can have 1 or more roles.
Roles can have one or more Permissions.

Implement REST endpoints for following operation
============================================
1. Given user, return list of names of permissions that this user is entitled to.
url : http://<server>/user/<userid> (GET method)

2. Given user and permission, return boolean if entitled or not. 
url : http://<server>/checkpermission/?userid=<user_id>&permissionid=<permission_id> (GET Method)

3. Modify permissions of a role 
url : http://<server>/roles/<roleid> POST_PARAM:{"permissions":["perm5"]} (POST Method)

4. Delete a permission 
url : http://<server>/permissions/<permission_id> DELETE.


Load following json data from file into memory: No need to use an external data store.
=============================================
Users
=====
{
"id":"user1",
"roles":["role1","role3"]
}

Roles
=====
{
"id":"role1",
"permissions":["perm1","perm5"]
},
{
"id":"role3",
"permissions":["perm6","perm7"]
}

Permissions
=========
{
"id":"perm1",
"name":"Can check balance"
},
{
"id":"perm5",
"name":"Can deposit"
},
{
"id":"perm6",
"name":"Can Transfer"
},
{
"id":"perm7",
"name":"Can withdraw"
}


Setting up and running the code and the test cases
==============================================================================
(first cd into the folder)

For installing Dependencies : 
run "npm install"

Running the tests : 
run "npm test"

For running the server :
run "node server.js"
then go to browser or postman or any servive which you want to use and use the following APIs
1. GET http://localhost:9000/user/<userid>
2. GET http://localhost:9000/checkpermission/?userid=<user_id>&permissionid=<permission_id>
3. POST http://localhost:9000/roles/<roleid>  with POST_PARAM:{"permissions":["perm5"]}
4. DELETE http://localhost:9000/permissions/<permission_id>