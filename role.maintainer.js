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
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store.getCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(target) {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD || (structure.structureType == STRUCTURE_WALL && structure.hits < 200000) || (structure.structureType == STRUCTURE_RAMPART && structure.hits < 1000000)) &&
                            structure.hits < structure.hitsMax;
                    }
            });
            if(target) {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};

module.exports = roleMaintainer;