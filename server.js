var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 9000;

var usersFile = "./users.json";
var rolesFile = "./roles.json";
var permissionsFile = "./permissions.json";

//Given user, return list of names of permissions that this user is entitled to
app.get('/user',(req,res) => {
	res.status(400).send("userid not provided.");
})

app.get('/user/:userId',(req,res) => {
	var userId = req.params.userId;
	if(!userId)
		return res.status(400).send("userid not provided");

	var usersData = JSON.parse(fs.readFileSync(usersFile).toString());
	var rolesData = JSON.parse(fs.readFileSync(rolesFile).toString());
	var permissionsData = JSON.parse(fs.readFileSync(permissionsFile).toString());

	if(userId && usersData.hasOwnProperty(userId)){
		var entitledPermissions = [];
		for(var roleIndex in usersData[userId].roles){
			var role = usersData[userId].roles[roleIndex];
			for(var permissionIndex in rolesData[role].permissions){
				var permission = rolesData[role].permissions[permissionIndex];
				if(entitledPermissions.indexOf(permissionsData[permission].name) === -1) entitledPermissions.push(permissionsData[permission].name)
			}
		}
		res.status(200).send(entitledPermissions);
	}
	else{
		res.status(400).send("user with the given userId:"+userId+" does not exist")
	}
})

//Given user and permission, return boolean if entitled or not.
app.get('/checkpermission',(req,res) => {
	var userId = req.query.userid;
	var permissionId = req.query.permissionid;
	if(!userId || !permissionId)
		return res.status(400).send("userid or permissionid not provided");

	var usersData = JSON.parse(fs.readFileSync(usersFile).toString());
	var rolesData = JSON.parse(fs.readFileSync(rolesFile).toString());
	var permissionsData = JSON.parse(fs.readFileSync(permissionsFile).toString());

	if(usersData.hasOwnProperty(userId)){
		var ifEntitled = false;
		for(var roleIndex in usersData[userId].roles){
			var role = usersData[userId].roles[roleIndex];
			for(var permissionIndex in rolesData[role].permissions){
				var permission = rolesData[role].permissions[permissionIndex];
				if(permission == permissionId) ifEntitled = true;
			}
		}
		res.status(200).send(ifEntitled);
	}
	else{
		res.status(400).send("the database does not have a user with the given userId")
	}
})

app.post('/roles',(req,res) => {
	res.status(400).send("roleid not provided");
})
//Modify permissions of a role
app.post('/roles/:roleId',(req,res) => {
	var roleId = req.params.roleId;
	var permissions = req.body.permissions;
	if(!roleId || !permissions)
		return res.status(400).send("roleId or permissions not provided");

	var rolesData = JSON.parse(fs.readFileSync(rolesFile).toString());
	var permissionsData = JSON.parse(fs.readFileSync(permissionsFile).toString());

	//check if the permissions passed are valid
	for(permissionIndex in permissions){
		var permission = permissions[permissionIndex];
		if(!permissionsData.hasOwnProperty(permission)){
			return res.status(400).send("permissions:" + permission + " does not exists in the permissions database");
		}
	}

	if(rolesData.hasOwnProperty(roleId)){
		rolesData[roleId].permissions = permissions
		fs.writeFileSync(rolesFile,JSON.stringify(rolesData));
		res.status(201).send("successfully modified");
	}
	else{
		res.status(400).send("role with the given roleId:"+roleId+" does not exist");
	}
});

//Delete a permission
app.delete('/permissions',(req,res) => {
	res.status(400).send("no permissionid provided");
})
app.delete('/permissions/:permissionId',(req,res) => {
	var permissionId = req.params.permissionId;
	if(!permissionId)
		return res.status(400).send("permissionsId not provided");

	var rolesData = JSON.parse(fs.readFileSync(rolesFile).toString());
	var permissionsData = JSON.parse(fs.readFileSync(permissionsFile).toString());

	//delete recursively from roles
	for(var role in rolesData){
		rolesData[role].permissions = rolesData[role].permissions.filter(function(a){return a != permissionId;});
	}
	fs.writeFileSync(rolesFile,JSON.stringify(rolesData));

	//delete from permissions
	if(permissionsData.hasOwnProperty(permissionId)){
		delete permissionsData[permissionId]
		fs.writeFileSync(permissionsFile,JSON.stringify(permissionsData));
	}
	else{
		res.status(200).send("the permission:"+permissionsId+" doesn't exist in permissions data, so can be said to be successfully deleted");
	}

	res.status(200).send("permission successfully deleted");
})

app.listen(port);
console.log("the app is running just fine");

module.exports = app;