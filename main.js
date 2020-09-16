var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintainer');
var roleTransporter = require('role.transporter');
var roleRemoteBuilder = require('role.remoteBuilder');


module.exports.loop = function () {

    // TBH best way to reference rooms is by name directly and then throw it into 'E47N27' like Game.rooms['E47N27']


    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    //
    
    var towerRepair = 0;
    
    if ((Game.rooms['E47N27'].energyAvailable)/(Game.rooms['E47N27'].energyCapacityAvailable) > .95) {
        //console.log(Game.rooms['E47N27'].energyAvailable == Game.rooms['E47N27'].energyCapacityAvailable);
        //towerRepair = 1;
    }
    else
    {
        towerRepair = 0;
    }
    
    //console.log((Game.rooms['E47N27'].energyAvailable / Game.rooms['E47N27'].energyCapacityAvailable));
    
        //The Towers
        var tower = Game.getObjectById('5f5a8cb72be617a4ee8040a2');
        var tower2 = Game.getObjectById('5f5f0c3fb285fe2acd5e6c15');
        if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
        else if(towerRepair) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => (( structure.hits < structure.hitsMax) && (structure.hits < 20000))
            });
            if(closestDamagedStructure && (((tower.store.getUsedCapacity(RESOURCE_ENERGY))/(tower.store.getCapacity(RESOURCE_ENERGY))) > .8 )){
                tower.repair(closestDamagedStructure);  
                }
            }    
        }

        if(tower2) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }
    
    
    
    
    // Variables for container assignments
    //var storageContainerIDs == [room E47N27 pos 33,42],[room E47N27 pos 35,40],[room E47N27 pos 35,39]
    //var miningContainerIDs == [room E47N27 pos 35,45],[room E47N27 pos 35,44]
    //removalContainers, depositcontainers
    
    //var depositcontainers = "[room E47N27 pos 33,42,room E47N27 pos 35,40,room E47N27 pos 35,39]";

    
    var depositContainers = Game.rooms['E47N27'].find(FIND_STRUCTURES, {
         filter: (structure) => {
            return (([STRUCTURE_CONTAINER,STRUCTURE_LINK].includes(structure.structureType)) && (['33, 42','35, 40','38, 20','35, 42','37, 42'].includes(structure.pos.x+', '+structure.pos.y)) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
         }});

         //,STRUCTURE_STORAGE
    //console.log('deposit container ' +depositContainers);

    //depositContainers = [];
    //depositContainers[0] ="[room E47N27 pos 33,42]";
    //depositContainers[1] ="[room E47N27 pos 35,40]";
    //depositContainers[2] ="[room E47N27 pos 35,39]";
    //[room E47N27 pos 33,42],[room E47N27 pos 35,40],[room E47N27 pos 35,39];

    //var removalContainers = [];
    var removalContainers = Game.rooms['E47N27'].find(FIND_STRUCTURES, {
        filter: (structure) => {
           return ((structure.structureType == STRUCTURE_CONTAINER) && (['35, 44','35, 45'].includes(structure.pos.x+', '+structure.pos.y)) && (structure.store.getUsedCapacity(RESOURCE_ENERGY)))
        }});
   //console.log('removal container ' + removalContainers);

    //removalContainers[0] ="[room E47N27 pos 35,45]";
    //removalContainers[1] ="[room E47N27 pos 35,44]";
    //"[room E47N27 pos 35,45,room E47N27 pos 35,44]";

    
    //define variables to determine how many of each type of worker there are
    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    
    var harvestersN0 = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && creep.memory.assignedNode == 0);
    var harvestersN1 = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && creep.memory.assignedNode == 1);

    var transporters = _.filter(Game.creeps, (creep) => creep.memory.role == 'transporter');

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');

    // If spawn gets hit, send zone into safe mode

    if((Game.spawns['Spawn1'].hits)/(Game.spawns['Spawn1'].hitsMax) < 1)
    {
        //console.log('Safe Mode Activated');
        if (Game.rooms.safeMode == undefined) {
            Game.rooms.controller.activateSafeMode();   
        }
        
    }
    else {
        //console.log('Safe Mode Not Activated');
    }


    //spawn code, move it into it's own function later


    //Exploratory Builder code
    /*var newName = 'remoteBuilder' + Game.time;
        //console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'remoteBuilder', assignedRoom: 'E47N27'}});
    */
    
    //400
    //400
    if(builders.length < 1) {
        var newName = 'Builder' + Game.time;
        //console.log('Spawning new Builder: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'builder'}});
    }
    
    if(maintainers.length < 1) {
        var newName = 'Maintainer' + Game.time;
        //console.log('Spawning new maintaner: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'maintainer'}},
            {memory: {repairing: false}});
    }
    //600
    //4200
    if(upgraders.length <4) {
        var newName = 'Upgrader' + Game.time;
        //console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'upgrader'}});
    }
    //300
    //600
    //decide if Alpha transporter present, if not create one
    var primaryTransporter = false;
    var tombstoneTransporter = false;
    //var transporterHomeRoom
    var alphaTransporterCount = (_.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.alphaTransporter == true))));
    var tombstoneTransporterCount = (_.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.tombstoneTransporter == true))));
    //console.log(alphaTransporterCount.length);
    if(alphaTransporterCount.length == 0) {
        primaryTransporter = true;
        //console.log('no alpha transporter exists, spawning one');
    }
    else if (tombstoneTransporterCount.length == 0)
    {
        tombstoneTransporter = true;
    }


    if(transporters.length < 3) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, alphaTransporter: primaryTransporter, tombstoneTransporter: tombstoneTransporter}});
    }
    
    //removalContainers, depositcontainers
    
    //Prioritize Node 0, it has more open slots
    var nodeAssignment = 0;
    if (harvestersN0.length > harvestersN1.length) {
        nodeAssignment = 1;
    }
    
    //700
    //1400
    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        //console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE], newName, 
            {memory: {role: 'harvester', harvesting: '1',assignedNode: nodeAssignment}});
    }
    
    //Advanced Spawner assignment code
    //var nodes = creep.room.find(FIND_SOURCES);
    //var containers = 


    //var harvesterN1 = _.filter(Game.creeps, (creep) => creep.memory.assignedNode == '' && creep.memory.assignedContainer == '');


    //var harvestersN2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.assignedNode == 2);
    //console.log('Node 1 harvesters: ' + harvestersN1.length);
    //console.log('Node 2 harvesters: ' + harvestersN2.length);

    //var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');


    /*if(harvesterN1.length < 1) {
        var newName = 'HeavyHarvester' + Game.time;
        //console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,MOVE], newName, 
            {memory: {role: 'heavyHarvester', assignedNode: '0', assignedContainer}});
    } */






    // end spawn code
    
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    //transferEnergy(target, [amount])


    // Make link transfer between links
    const linkFrom = Game.rooms['E47N27'].lookForAt('structure', 35, 42)[1];
    //console.log(linkFrom);
    const linkTo = linkFrom.room.find(FIND_MY_STRUCTURES,
        {filter: {structureType: STRUCTURE_LINK}})[1];
    //console.log(linkTo);
    linkFrom.transferEnergy(linkTo);

    //console.log(linkTo.structureType);

    //Creep operation code
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'transporter') {
            roleTransporter.run(creep, removalContainers, depositContainers);
        }
        //console.log('transporter count ' + transporters.length)
        //removalContainers, depositcontainers
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'maintainer') {
            roleMaintainer.run(creep);
        }
        try {
            if(creep.memory.role == 'remoteBuilder') {
                roleRemoteBuilder.run(creep);
            }
        } catch (error) {
            console.log('RemoteBuilder had an error:' + error);
        }
        
    }
}

// Console Commands
// delete Memory.rooms
// Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'Remotebuildertest', {memory: {role: 'remoteBuilder', assignedRoom: 'E48N27'}});
// for( var site of (Game.rooms['E48N27'].find(FIND_CONSTRUCTION_SITES)) ){site.remove()}