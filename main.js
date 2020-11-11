var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMaintainer = require('role.maintainer');
var roleTransporter = require('role.transporter');
var roleRemoteBuilder = require('role.remoteBuilder');
var roleRemoteClaimer = require('role.remoteClaimer');
var roleRemoteUpgrader = require('role.remoteUpgrader');
var roleTurret = require('role.turret');
var roleRangedHarasser = require('role.RangedHarasser');
var roleTowerSoaker = require('role.TowerSoaker');
var MemoryMgr = require('MemoryMgr');
var RoomMgr = require('RoomMgr');

//Required for profiler
const profiler = require('screeps-profiler');

/*
module.exports.loop = function() {
  profiler.wrap(function() {
    // Main.js logic should go here.
  });
}
*/

//Enables profiler
profiler.enable();
module.exports.loop = function () {
    //Profiler function wrap
    profiler.wrap(function() {
    //GLOBAL CONSTANTS
    const turretMemoryUpdateRate = 250;
    const buildSpawningListUpdateRate = 50;
    const spawnerMemoryUpdateRate = 100;
    const linkMemoryUpdateRate = 150;


    //Flags to force Memory Updates
    var updateSpawnerMemory = false;

    //GLOBAL variables



    //
    /*
    // This will create a new battlegroup
    Memory.BattleGroup.Alpha.initialized = false;
    Memory.BattleGroup.Alpha.spawned = false;
    Memory.BattleGroup.Alpha.targetRoom = '';
    Memory.BattleGroup.Alpha.stagingRoom = '';
    Memory.BattleGroup.Alpha.rallyRoom = '';
    */

    // TBH best way to reference rooms is by name directly and then throw it into 'E47N27' like Game.rooms['E47N27']


    //Default code to clean from memory list of dead creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    
    var depositContainers = Game.rooms['E47N27'].find(FIND_STRUCTURES, {
         filter: (structure) => {
            return (([STRUCTURE_CONTAINER,STRUCTURE_LINK].includes(structure.structureType)) && (['33, 42','35, 42','38, 20','37, 42'].includes(structure.pos.x+', '+structure.pos.y)) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
         }});

         //,STRUCTURE_STORAGE
    //console.log('deposit container ' +depositContainers);


    //var removalContainers = [];
    var removalContainers = Game.rooms['E47N27'].find(FIND_STRUCTURES, {
        filter: (structure) => {
           return ((structure.structureType == STRUCTURE_CONTAINER) && (['35, 44','35, 45'].includes(structure.pos.x+', '+structure.pos.y)) && (structure.store.getUsedCapacity(RESOURCE_ENERGY)))
        }});
   //console.log('removal container ' + removalContainers);


    
    //define variables to determine how many of each type of worker there are
    var transporters = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.assignedRoom == 'E47N27')));
    
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    var upgraders = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'upgrader') && (creep.memory.assignedRoom == 'E47N27')));

    var maintainers = _.filter(Game.creeps, (creep) => creep.memory.role == 'maintainer');

    // If spawn gets hit, send zone into safe mode
    // || ((Game.spawns['Spawn2'].hits)/(Game.spawns['Spawn2'].hitsMax) < 1)
    if(((Game.spawns['Spawn1'].hits)/(Game.spawns['Spawn1'].hitsMax) < 1))
    {
        //console.log('Safe Mode Activated');
        if (Game.rooms.safeMode == undefined) {
            Game.rooms.controller.activateSafeMode();   
        }
        
    }
    else {
        //console.log('Safe Mode Not Activated');
    }

    //Set Memory Unit Count code
    //delete Memory.rooms.E48N26.units;
    if(Memory.rooms.E47N27.units == undefined)
    {
        Memory.rooms.E47N27.units = {}; //create unit set for new room
        Memory.rooms.E47N27.units.transporter = 1;
        //Memory.rooms.E48N26.units.maintainer = 1;
        //Memory.rooms.E48N26.units.builder = 1;
        //Memory.rooms.E48N26.units.upgrader = 1;
        //Memory.rooms.E48N26.units.maintainer = 1;

        //Note harvesters are defined in other code, they're managed on a per-node basis
    }


    //Spawning from memory code
    //A. For loop - iterate through each room
    //B. Grab unit object from memory
    //C. Check if there are spawners
    //D. Check if the spawner is already spawning?
    //E. 

    // Note this is on an update rate speed
    // Maybe try a scheduler on units? Each unit calculates it's death time and then pushes it into a schedule of Game.times to re-evaluate unit spawns?
    if(((Game.time % buildSpawningListUpdateRate) == 0) && (false)) // Set to AND false right now while it's a WIP
    {
        
        try {
    
            //Create an array of the rooms to iterate through
            var roomIDs = Array.from(Object.keys(Game.rooms));
            //console.log(roomIDs);
            //console.log(Object.keys(Game.rooms));
            var roomIDsLength = roomIDs.length;
            //console.log(roomIDsLength);
            
            //console.log(roomIDs);
            //console.log(Object.keys(Game.rooms));
            

            //An Array of units that need to be created. Units will be pushed onto this array.
            var unitsToBeSpawned = [];

            //Variable for the room we're currently in
            var tempRoom;

            //These are empty, will be split up when the unit object is grabbed from the room
            var unitType = [];
            var unitCount = [];
        

            for(i = 0; i < roomIDsLength; i++)
            {
                //Split unit object into unitType and unitCount objects
                unitType = Array.from(Object.keys(Game.rooms[roomIDs[i]].units));
                unitCount = Array.from(Object.values(Game.rooms[roomIDs[i]].units));
                console.log(unitType);
                console.log(unitCount);
                

                //Grab the ID of the room we're in
                tempRoom = String(roomIDs[i]);
                //console.log('temproom iteration ' + i + ' ' + tempRoom);

                //Iterate through all the unit roles for the room
                for(j = 0; j < unitType.length; j++)
                {
                    //Get the count of creeps of that role type
                    tempUnitRoomCount = _.filter(Game.creeps, (creep) => (creep.memory.role == unitType[j]) && (creep.memory.assignedRoom == tempRoom) );

                    //Check if the unit count is under what it is supposed to be. If it is, pop the unit onto a spawning list
                    if(tempUnitRoomCount.length < unitCount[j])
                    {
                        var count = unitCount[j] - tempUnitRoomCount.length;
                        //Pushes an object into unitsToBeSpawned, which gives how many
                        console.log("Queuing " + count + "units of type "+ unitType[j] + " at room " + tempRoom);
                        do {
                            unitsToBeSpawned.push({unitType: unitType[j], room: tempRoom});
                            count --;
                        } while (count > 0);

                    }
                }
                //console.log(i);

                //TODO: Grab all spawns from memory, grab their rooms, and see if there is a matching unit in queue (unitsToBeSpawned)
                Memory.rooms.forEach(room => {
                    Memory.rooms[room].spawns.forEach(spawn => {
                        var spawnObject = Game.getObjectById(spawn)
                        if(spawnObject.spawning == null)
                        {
                            //Game.getObjectById(spawn).spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
                            //    {memory: {role: 'remoteBuilder', assignedRoom: 'E47N26'}});
                        }
                    });
                });
    
            }
        } 
        catch (error) 
        {
                console.log(error + ' - unit spawner code from memory is broke yes, yes')
                console.log(error.stack);
        }

    }

    //Temporary Ranged Harrasers

    //if(Game.time % 50 == 0)
    //{
        /*
        Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,MOVE], 'yee boi', 
            {memory: {role: 'RangedHarasser', assignedRoom: 'E48N29'}});

        Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,MOVE], 'yee boi2', 
            {memory: {role: 'RangedHarasser', assignedRoom: 'E49N28'}});

        Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL], 'beefy boi', 
            {memory: {role: 'TowerSoaker', soakRoom: 'E49N29', safeRoom: 'E48N29'}});

        Game.spawns['Spawn1'].spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,MOVE], 'yee boi3', 
            {memory: {role: 'RangedHarasser', assignedRoom: 'E48N29'}});
        */
    //}
    



    //Spawning count control code

    // Room 4 units (E49N29) units
    var remoteBuildersR4 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == 'E49N29');
    if(remoteBuildersR4.length < 1) {
        var newName = 'remoteBuilder' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE49N29'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'remoteBuilder', assignedRoom: 'E49N29'}});
    }

    var upgradersR4 = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.assignedRoom == 'E49N29');
    if(upgradersR4.length < 5) {
        var newName = 'upgrader' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE49N29'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'upgrader', assignedRoom: 'E49N29'}});
    }
    
    var transportersE49N29 = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.assignedRoom == 'E49N29')));
    if(transportersE49N29.length < 1) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['SpawnE49N29'].spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E49N29'}});
    }
    

    // Room 3 units (E47N26) units
    var remoteBuildersR3 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == 'E47N26');
    if(remoteBuildersR3.length < 1) {
        var newName = 'remoteBuilder' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE47N26'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'remoteBuilder', assignedRoom: 'E47N26'}});
    }

    var remoteUpgradersR3 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteUpgrader' && creep.memory.assignedRoom == 'E47N26');
    if(remoteUpgradersR3.length < 3) {
        var newName = 'remoteUpgrader' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE47N26'].spawnCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'remoteUpgrader', assignedRoom: 'E47N26'}});
    }

    var transportersE47N26 = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.assignedRoom == 'E47N26')));
    //console.log(transportersE47N26);
    if(transportersE47N26.length < 2) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['SpawnE47N26'].spawnCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E47N26'}});
    }


    // Room 2 units (E48N26) units
    var remoteBuildersR2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == 'E48N26');
    if(remoteBuildersR2.length < 1) {
        var newName = 'remoteBuilder' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE48N27'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'remoteBuilder', assignedRoom: 'E48N26'}});
    }

    var remoteUpgradersR2 = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteUpgrader' && creep.memory.assignedRoom == 'E48N26');
    if(remoteUpgradersR2.length < 3) {
        var newName = 'remoteUpgrader' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE48N26'].spawnCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'remoteUpgrader', assignedRoom: 'E48N26'}});
    }

    var transportersE48N26 = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.assignedRoom == 'E48N26')));
    //console.log(transportersE48N26);
    if(transportersE48N26.length < 3) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['SpawnE48N27'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E48N26'}});
    }

    // Room 1 (E48N27) units
    
    var remoteBuilders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteBuilder' && creep.memory.assignedRoom == 'E48N27');
    if(remoteBuilders.length < 1) {
        var newName = 'remoteBuilder' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE48N27'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'remoteBuilder', assignedRoom: 'E48N27'}});
    }

    
    var remoteUpgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteUpgrader' && creep.memory.assignedRoom == 'E48N27');
    if(remoteUpgraders.length < 2) {
        var newName = 'remoteUpgrader' + Game.time;
        //console.log('Spawning new remoteBuilder: ' + newName);
        Game.spawns['SpawnE48N27'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'remoteUpgrader', assignedRoom: 'E48N27'}});
    }

    
    var transportersE48N27 = _.filter(Game.creeps, (creep) => ((creep.memory.role == 'transporter') && (creep.memory.assignedRoom == 'E48N27')));
    //console.log(transportersE48N27);
    if(transportersE48N27.length < 2) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['SpawnE48N27'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E48N27'}});
    }
    
    //"Temporary" transporter spawners
    /*
    if(Game.time % 50 == 0)
    {
        Game.spawns['SpawnE47N26'].spawnCreep([CARRY,CARRY,MOVE,MOVE], 'yee boi', 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E47N26'}});

        Game.spawns['SpawnE48N26'].spawnCreep([CARRY,CARRY,MOVE,MOVE], 'yee boi2', 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E48N26'}});
    }
    */

    // Room 0 (E47N27) units
    if(builders.length < 0) {
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
    if(upgraders.length < 2) {
        var newName = 'Upgrader' + Game.time;
        //console.log('Spawning new upgrader: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE], newName, 
            {memory: {role: 'upgrader' , assignedRoom: 'E47N27'}});
    }

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

    


    if(transporters.length < 2) {
        var newName = 'Transporter' + Game.time;
        //console.log('Spawning new transporter: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName, 
            {memory: {role: 'transporter', transporting: false, assignedRoom: 'E47N27'}});
    }


    
    /*
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    
    var harvestersN0 = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.assignedNode == 0));
    var harvestersN1 = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.assignedNode == 1));


    
    //Prioritize Node 0, it has more open slots
    var nodeAssignment = 0;
    if (harvestersN0.length > harvestersN1.length) {
        nodeAssignment = 1;
    }
    */

    /*
    if(harvesters.length < 2) {
        var newName = 'Harvester' + Game.time;
        //console.log('Spawning new harvester: ' + newName);
        Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE], newName, 
            {memory: {role: 'harvester', harvesting: '1', assignedNode: nodeAssignment}});
    }
    */




    //Harvester spawning code. All nodes need 1 harvester and are assumed to have containers, spawners, storage, or extensions to take things to.
    //This works off of Memory and Rooms. Rooms need to be updated with sourceNodes (i.e. Memory.rooms['E47N27'].sourceNodes)
    
    //console.log(Object.keys(Game.rooms).length);
    
    //Gonna do spawns for each room.
    ///*
    // i represents each room, j represents each node in each room
    try {
        
        //Use Memory.rooms, not Game.rooms because Game.rooms returns all rooms that creeps are in
        //var roomIDs = Array.from(Object.keys(Game.rooms));
        var roomIDs = Array.from(Object.keys(Memory.rooms));
        //console.log(roomIDs);
        //console.log(Object.keys(Game.rooms));
        var roomIDsLength = Object.keys(Memory.rooms).length;
        //console.log(roomIDsLength);
        
        var tempRoom;
        var tempNode;
        var tempHarvestersRoomCount = [];
        var tempSourceArray = [];

        // _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.assignedRoom == creep.memory.assignedRoom);
        

        if(true) {
            for(i = 0; i < roomIDsLength; i++)
            {
                //Get the count of creeps and the count of nodes.
                tempRoom = String(roomIDs[i]);
                //console.log('temproom iteration ' + i + ' ' + tempRoom);
                tempHarvestersRoomCount = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.assignedRoom == creep.memory.tempRoom) );
                
                if(tempSourceArray = Game.rooms[roomIDs[i]].find(FIND_SOURCES))
                {

                }
                //console.log(i);
                //If there aren't as many workers as nodes, figure out and spawn a worker for the node that is missing a worker.
                //if(tempHarvestersRoomCount.length < tempSourceArray.length) {

                //Need to make this if statement check if the room has been initialized and there 
                //if((Memory.rooms[tempRoom].roomIntializationComplete == true) && (tempSourceArray.length == undefined)) {
                if(true)
                {
                    for(j = 0; j < tempSourceArray.length; j++)
                    {
                        //console.log(i + ' ' + j);
                        //This will break/not work well when there are multiple spawns in the same room.
                        //This checks if there is a role with the corresponding role and assignedNode
                        tempNode = tempSourceArray[j];
                        //console.log(tempNode);
                        var tempNodeMissing = false;
                        //console.log( !(_.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.assignedNode == tempNode.id)) == false) );
                        var nodeHarvesterCount = (_.filter(Game.creeps, (creep) => ((creep.memory.role == 'harvester') && (creep.memory.assignedNodeID == tempNode.id))));
                        //console.log(nodeHarvesterCount.length);
                        if(nodeHarvesterCount.length < 1) {
                            tempNodeMissing = true;
                            console.log('spawning harvester with a target tempNode.id: '+ tempNode.id );
                        }
                        //console.log(tempNodeMissing);
                        //_.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.assignedNode == tempNode.id))

                        if(tempNodeMissing) {
                            var tempSpawn = Game.rooms[tempRoom].find(FIND_MY_SPAWNS);
                            var roomSpawn = tempSpawn[0];
                            var newName = 'Harvester' + Game.time;
                            //console.log(roomSpawn.name);
                            //console.log(tempRoom);
                            
                            //console.log('Spawning new harvester: ' + newName);
                            //console.log(tempNode.id);
                            //Temporary code since all spawns can't spawn this level of worker
                            //console.log(tempSpawn);
                            //console.log(Game.spawns[roomSpawn.name].room.energyCapacityAvailable);
                            if(roomSpawn && Game.spawns[roomSpawn.name].room.energyCapacityAvailable > 750)
                            {
                                Game.spawns[roomSpawn.name].spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE], newName, 
                                {memory: {role: 'harvester', assignedNodeID: tempNode.id, assignedRoomID: tempNode.room}})
                            }
                            else if(roomSpawn && Game.spawns[roomSpawn.name].room.energyCapacityAvailable > 549)
                            {
                                Game.spawns[roomSpawn.name].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE], newName, 
                                    {memory: {role: 'harvester', assignedNodeID: tempNode.id, assignedRoomID: tempNode.room}})
                            }
                            else if(roomSpawn && Game.spawns[roomSpawn.name].room.energyCapacityAvailable > 299)
                            {
                                Game.spawns[roomSpawn.name].spawnCreep([WORK,WORK,CARRY,MOVE], newName, 
                                    {memory: {role: 'harvester', assignedNodeID: tempNode.id, assignedRoomID: tempNode.room}})
                            }
                            //This is eventual code
                            //roomSpawn.spawnCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE], newName, 
                            //{memory: {role: 'harvester', assignedNode: tempNode.id, assignedRoom: tempNode.room}})
                        }
                    }
                }
            }
        }

    } catch (error) 
    {
            console.log(error + ' - is broke yes, yes')
            console.log(error.stack);
    }
    //*/

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

    //Testing to operate a link
    RoomMgr.operateLinks('E47N27');
    RoomMgr.operateLinks('E49N29');
    //RoomMgr.operateLinks({'E47N27', Game});

    /*
    var room = 'E47N27';
    //Spawning code test
    try {
        //console.log(Memory.rooms[room].links);
        var links = Memory.rooms[room].links;
        //console.log(links.length);
        var senders = [];
        var both = [];
        var receivers = [];
        var sendToRecieverThreshold = 200;
        //(receiver, sender, both, none)
        // Categorize the links

        for(let link of links)
        {
            console.log(link.id);
            if(link.linkType == 'senders')
            {
                console.log(Game.getObjectByID(link.id));
                senders.push(Game.getObjectByID(link.id));
                console.log('senders: ' + Game.getObjectByID(link.id));
            }
            else if(link.linkType == 'both')
            {
                console.log(Game.getObjectByID(link.id));
                both.push(Game.getObjectByID(link.id));
            }
            else if(link.linkType == 'receiver')
            {
                console.log('receivers: ' +Game.getObjectByID(link.id));
                receivers.push(Game.getObjectByID(link.id));
            }
        }

        for(const sender of senders)
        {
            var target;
            //If the sender can't send, then don't bother with anything else
            if(sender.cooldown == 0 && sender.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                for(const receiver of receivers)
                {
                    if(receiver.store.getFreeCapacity(RESOURCE_ENERGY) > sendToRecieverThreshold)
                    {
                        target = receiver;
                    }
                }
                if(target == undefined)
                {
                    for(const bothLink of both)
                    {
                        if(bothLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                        {
                            target = bothLink;
                        }
                    }
                }
            }
            console.log(target);
            if(target)
            {
                sender.transferEnergy(target);
            }

        }


    } catch (error) {
        console.log('RoomMgr.operateLinks code is failing. Error:' + error.stack)
    }
    */

    //Old code for links
    /*
    if(true)
    {
    // Make link transfer between links
    const linkFrom = Game.rooms['E47N27'].lookForAt('structure', 35, 42)[1];
    //console.log(linkFrom);
    const linkTo = linkFrom.room.find(FIND_MY_STRUCTURES,
        {filter: {structureType: STRUCTURE_LINK}})[1];
    //console.log(linkTo);
    linkFrom.transferEnergy(linkTo);
    }
    */

    //console.log(linkTo.structureType);

    //Creep operation code
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        try {
            if(creep.memory.role == 'transporter') {
                roleTransporter.run(creep, removalContainers, depositContainers);
            }
            
        } catch (error) {
            console.log('your transporter code sucks');
            console.log('Transporter had an error:' + error);
            console.log('Transporter had an error:' + error.stack);
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

        // Remote Builder execution code
        try {
            if(creep.memory.role == 'remoteBuilder') {
                roleRemoteBuilder.run(creep);
            }
        } catch (error) {
            console.log('RemoteBuilder had an error:' + error);
        }

        // Remote Claimer execution code
        try {
            if(creep.memory.role == 'remoteClaimer') {
                roleRemoteClaimer.run(creep);
            }
        } catch (error) {
            console.log('RemoteClaimer had an error:' + error);
        }
        
        // Remote Upgrader execution code
        try {
            if(creep.memory.role == 'remoteUpgrader') {
                roleRemoteUpgrader.run(creep);
            }
        } catch (error) {
            console.log('RemoteUpgrader had an error:' + error);
        }

        // Ranged Harasser execution code
        try {
            if(creep.memory.role == 'RangedHarasser') {
                roleRangedHarasser.run(creep);
            }
        } catch (error) {
            console.log('RangedHarasser had an error:' + error);
            console.log('RangedHarasser had an error:' + error.stack);
        }

        // Tower Soaker execution code
        try {
            if(creep.memory.role == 'TowerSoaker') {
                roleTowerSoaker.run(creep);
            }
        } catch (error) {
            console.log('TowerSoaker had an error:' + error);
            console.log('TowerSoaker had an error:' + error.stack);
        }
    }
    
    //Turret code, roles ect
    if(Memory.turrets)
    {
        for(var turret of Memory.turrets) {
            //console.log(turret);
            // Turret execution code
            try {
                roleTurret.run(Game.getObjectById(turret));
            } catch (error) {
                delete Memory.turrets;
                console.log('turret' + turret + ' no longer exists, deleting Memory.turrets to be rebuilt');
            }
        }
    }


    
    // Memory refreshes start here ----------------------------------------------------------------------------------------------------------------------------

    //Update spawners into memory. This catalogues them for easier access rather than doing a larger sort.
    if(((Game.time % spawnerMemoryUpdateRate) == 0) || updateSpawnerMemory)
    {
        // Puts all spawns into the room memory as an id.
        var rooms = Array.from(Object.keys(Memory.rooms));
        //console.log(rooms);
        var tempSpawns = [];

        // let towerArray = Memory.rooms[room].structures.towers.map(tower => Game.getObjectById(tower));

        rooms.forEach(element => {

            //Grabs all the spawns
            tempSpawns = Game.rooms[element].find(FIND_MY_SPAWNS);
            

            //Maps the spawn 
            var tempSpawnIDs = tempSpawns.map(spawn => spawn.id);

            console.log("Updating Spawn IDs: " + tempSpawnIDs);
            
            Memory.rooms[element].spawns = tempSpawnIDs;
        });


        /*
        rooms.forEach(element => {

            //Grabs all the spawns, replaces the spawns with the ID of the spawns instead of the object
            tempSpawns = Game.rooms[element].find(FIND_MY_SPAWNS);
            tempSpawnIDs = [];
            for(var i = 0; i < tempSpawns.length; i++)
            {
                tempSpawnIDs[i] = tempSpawns[i].id
            }

            console.log("Updating Spawn IDs: " + tempSpawnIDs);
            
            Memory.rooms[element].spawns = tempSpawnIDs;
        });
        */
    }

    if((Game.time % linkMemoryUpdateRate) == 0)
    {
        MemoryMgr.updateLinks();
    }

    //Update turret IDs into memory.
    if(((Game.time % turretMemoryUpdateRate) == 0) || (Memory.turrets == undefined)) 
    {

        //Delete current memory for Towers
        if(Memory.turrets)
        {
            delete Memory.turrets;
        }

        //making an empty list to push things onto
        var turretList = [];

        for(var structure in Game.structures) //Game.structures returns all the IDs
        {
            //console.log((structure));
            if(Game.getObjectById(structure).structureType == STRUCTURE_TOWER)
            {
                //console.log(structure);
                //If it's a turret, push it onto the temp list
                turretList.push(structure);
            }
        }

        //Chuck that sucker into memory
        Memory.turrets = turretList;

        console.log('Updating Turret IDs: ' + turretList);
    }

    // Generate pixels (using up 5k pixels) when over 9000 cpu bucket
    if(Game.cpu.bucket > 9000)
    {
        Game.cpu.generatePixel()
    }

     //Line for screeps profiler
    });
    
}

// Console Commands
// delete Memory.rooms
// Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'Remotebuildertest', {memory: {role: 'remoteBuilder', assignedRoom: 'E48N27'}});
// for( var site of (Game.rooms['E48N27'].find(FIND_CONSTRUCTION_SITES)) ){site.remove()}


//
/*
switch(var variable) {
    case 'winning': 
        variable = 'yee';
        break
    case 'losing':
        variable = 'nooo!';
        break
    default:
        variable = 'idk';
        break
}
*/

/*
Game.spawns['SpawnE48N27'].spawnCreep([CLAIM,MOVE], 'ClaimerDESU', 
    {memory: {role: 'remoteClaimer', assignedRoom: 'E49N29'}});

Game.spawns['Spawn1'].spawnCreep([CLAIM,MOVE], 'ClaimerDESU', 
    {memory: {role: 'remoteClaimer', assignedRoom: 'E49N29'}});

*/