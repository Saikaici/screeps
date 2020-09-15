var roleMaintainer= {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.store.getUsedCapacity() == 0){
            creep.memory.mining = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.mining = false;
        }
        //creep.moveTo(30,40);
	    if(creep.memory.mining) {
            //check for any containers with resources to pull from
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        structure.store.getCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                //if there are no containers to pull from, mine instead
            //} else {
            //    var sources = creep.room.find(FIND_SOURCES);
            //    if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
            //        creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            //    }
            }
        }//should set it to put all of its resources into a container before dying
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD || (structure.structureType == STRUCTURE_WALL && structure.hits < 200) || (structure.structureType == STRUCTURE_RAMPART && structure.hits < 200)) &&
                            structure.hits < structure.hitsMax;
                    }
            });
            if(targets.length > 0) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleMaintainer;