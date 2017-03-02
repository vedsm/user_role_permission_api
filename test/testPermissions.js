var chai = require('chai');
var chaiHttp = require('chai-http');
var fs = require('fs');

var should = chai.should();
chai.use(chaiHttp);

var server = require('../server');

var usersFile = "./users.json";
var rolesFile = "./roles.json";
var permissionsFile = "./permissions.json";

describe('CheckPermissions', () => {
	beforeEach((done) => {
		//we need to set a default value for database before every test case
		var usersData = {"user1":{"id":"user1","roles":["role1","role3"]}};
		var rolesData = {"role1":{"id":"role1","permissions":["perm1","perm5"]},"role3":{"id":"role3","permissions":["perm6","perm7"]}};
		var permissionsData = {"perm1":{"id":"perm1","name":"Can check balance"},"perm5":{"id":"perm5","name":"Can deposit"},"perm6":{"id":"perm6","name":"Can Transfer"},"perm7":{"id":"perm7","name":"Can withdraw"}};

		fs.writeFileSync(usersFile,JSON.stringify(usersData));
		fs.writeFileSync(rolesFile,JSON.stringify(rolesData));
		fs.writeFileSync(permissionsFile,JSON.stringify(permissionsData));
		done();
	})

	//Given user, return list of names of permissions that this user is entitled to -> /user/user1
	describe("/GET http://<server>/user/<userid> Given user, it should return list of names of permissions that this user is entitled to.", () => {
		it('for /user/user1', (done) => {
			chai.request(server)
				.get('/user/user1')
				.end((err,res) => {
					res.should.have.status(200);
					res.body.should.be.a('array');
					var responseArray = res.body;
					if(arraysEqual(responseArray,["Can check balance","Can deposit","Can Transfer","Can withdraw"]));
					done();
				})
		})
		it('for /user/ ', (done) => {
			chai.request(server)
				.get('/user/')
				.end((err,res) => {
					res.should.have.status(400);
					// res.body.should.be.eql(["Can check balance","Can deposit","Can Transfer","Can withdraw"]);
					done();
				})
		})
	})

	//Given user and permission, return boolean if entitled or not ->  /checkpermission/?userid=user1&permissionid=perm1
	describe("/GET http://<server>/checkpermission?userid=<userid>&permissionid=<permissionid> Given user and permission, return boolean if entitled or not.", () => {
		it(' for /checkpermission?userid=user1&permissionid=perm1', (done) => {
			chai.request(server)
				.get('/checkpermission?userid=user1&permissionid=perm1')
				.end((err,res) => { 
					res.should.have.status(200);
					res.body.should.be.a('boolean');
					res.body.should.be.eql(true);
					done();
				})
		})
		it('for /checkpermission', (done) => {
			chai.request(server)
				.get('/checkpermission/')
				.end((err,res) => {
					res.should.have.status(400);
					done();
				})
		})
	})
	
	//Modify permissions of a role -> /roles/role1 POST_PARAM:{"permissions":["perm5"]}
	describe("/POST http://<server>/roles/<roleid> with POST_PARAM:{'permissions':[...]} Modifies permissions of a role", () => {
		it('for /roles/role1 with POST_PARAM:{"permissions":["perm5"]}', (done) => {
			chai.request(server)
				.post('/roles/role1')
				.send({'permissions' : ['perm5']})
				.end((err, res) => {
					res.should.have.status(201);
					var rolesData = JSON.parse(fs.readFileSync(rolesFile).toString());
					rolesData.role1.permissions.should.be.eql(['perm5']);
					done();
				})
		})
		it('for /roles/role1 empty POST_PARAM', (done) => {
			chai.request(server)
				.post('/roles/role1 with no POST_PARAM')
				.end((err, res) => {
					res.should.have.status(400);
					done();
				})
		})
		it('for /roles/ with POST_PARAM:{"permissions":["perm5"]}', (done) => {
			chai.request(server)
				.post('/roles/')
				.send({'permissions' : ['perm5']})
				.end((err, res) => {
					res.should.have.status(400)
					done();
				})
		})
	})

	//Delete a permission -> /permissions/perm1 DELETE.
	describe("/DELETE http://<server>/permissions/<permissionid> Deletes a permission", () => {
		it('for /permissions/perm1', (done) => {
			chai.request(server)
				.delete('/permissions/perm1')
				.end((err, res) => {
					res.should.have.status(200);
					var permissionsData = JSON.parse(fs.readFileSync(permissionsFile).toString());
					if(!permissionsData.hasOwnProperty("perm1"))
						done();
				})
		})
		it('for /permissions/', (done) => {
			chai.request(server)
				.delete('/permissions/')
				.end((err, res) => {
					res.should.have.status(400);
					done();
				})
		})
	})
})

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}