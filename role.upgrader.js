var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

		/*
		// Go to the assigned room. Get out of nasty edge cases
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		if(creep.memory.assignedRoom != undefined)
		{
			if(creep.room.name != creep.memory.assignedRoom) {
				creep.moveTo(new RoomPosition(25,25, creep.memory.assignedRoom)); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
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
		}
		else
		*/
		{

			if(creep.memory.upgrading && creep.store.getUsedCapacity() == 0) {
				creep.memory.upgrading = false;
				//creep.say('🔄 harvest');
			}
			if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
				creep.memory.upgrading = true;
				//creep.say('⚡ upgrade');
			}

			if(creep.memory.upgrading) {
				if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
			
			//finds structures that are closest
			else {
				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return ([STRUCTURE_CONTAINER, STRUCTURE_LINK].includes(structure.structureType) &&
							(structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()) );
					}
				});
				//console.log(targets);
				//return ((structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_LINK)) &&
				//we need the .pos of the targets, create new array and store them in there
				var vartargetpos = [targets.length];
				for(i = 0; i < targets.length; i++)
				{
					vartargetpos[i] = targets[i].pos;
				}
				//console.log(vartargetpos);			
			
				var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => { return ([STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_LINK].includes(structure.structureType) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 200)}});
				//var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => { return ([STRUCTURE_CONTAINER, STRUCTURE_LINK].includes(structure.structureType) && structure.store.getUsedCapacity() > 0)}}, vartargetpos);
				
				//console.log(target);
				if(target != null) {
					if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			}
		}
	}
				// If no target to get stuff to upgrade with, mine
            //if(target = null)
            //{
                //var sources = creep.room.find(FIND_SOURCES);
                //if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                //    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            //}
            
		
};

module.exports = roleUpgrader;
