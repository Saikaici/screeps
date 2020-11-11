var roleRemoteUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //Goal is to 
        // A - Go claim a room
        // B - Mine and upgrade room controller (remote builder)


		// Initialize memory.rooms if it doesn't exist
		const assignedRoom = creep.memory.assignedRoom;

		/*
		if(!Memory.rooms){
			Memory.rooms = {};
		}
		*/

		// State information
		if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            //creep.say('So Empty...');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        //creep.say('SO FULL');
		}
		

		// Go to the assigned room. Get out of nasty edge cases
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		if(creep.room.name != assignedRoom) {
			creep.moveTo(new RoomPosition(25,25,assignedRoom)); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
		}
		// Lots of awful edge cases around 0,1,48,49 room spots
		else if(creep.pos.x == 0) {
			creep.move(RIGHT);
		}
		else if(creep.pos.x == 49) {
			creep.move(LEFT);
		}
		else if(creep.pos.y == 0) {
			creep.move(BOTTOM);
		}
		else if(creep.pos.y == 49) {
			creep.move(TOP);
		}
		else if((creep.pos.x || creep.pos.y) == (1 || 48))
		{
			creep.moveTo(new RoomPosition(25,25,assignedRoom));
		}
		
		// Go to the room controller and upgrade it
		else if(creep.memory.upgrading && (creep.room.name = assignedRoom)) {
			if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
			}

		}
		
		// Part C
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		// If not building, it needs to harvest from the nearest node



		else if(!creep.memory.upgrading && Memory.rooms[assignedRoom].sourceNodes) {

			//Check for containers first
			var maxEnergyCheck = creep.store.getCapacity(RESOURCE_ENERGY);
            var target =  creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_STORAGE) || (structure.structureType == STRUCTURE_CONTAINER)) && (structure.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck));
                }
            });
            if(target != null) {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
			}
			else {
				var closestNode = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (node) => { return node.energy > 0}}, Memory.rooms[assignedRoom].sourceNodes);
            	if(creep.harvest(closestNode) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestNode, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			}

		}
		
	}
};

module.exports = roleRemoteUpgrader;