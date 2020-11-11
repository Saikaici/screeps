var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

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
						(structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0) );
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
		
			var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => { return ([STRUCTURE_CONTAINER, STRUCTURE_LINK].includes(structure.structureType) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)}});
			//var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (structure) => { return ([STRUCTURE_CONTAINER, STRUCTURE_LINK].includes(structure.structureType) && structure.store.getUsedCapacity() > 0)}}, vartargetpos);
			
			//console.log(target);
			if(target != null) {
				if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffffff'}});
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
