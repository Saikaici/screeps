var roleHeavyHarvester = {

//Dedicated 550 cost worker - 50 MOVE, 5x100 WORK
//This creep has no space and must stand adjacent to harvested node on a container

    /** @param {Creep} creep **/
    run: function(creep) {
        //variables: assigned node, assigned container to stand on

        //Check state and update accordingly NOPE, this thing only mines.
	    //if((creep.store.getUsedCapacity() == 0) ){
        //    creep.memory.harvesting = true;
        //} else if (creep.store.getFreeCapacity() == 0) {
        //    creep.memory.harvesting = false;
        //}

        // Mining
    
        //var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(creep.memory.assignedNode) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[creep.memory.assignedContainer], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    
        //// Drop off Resources at Spawn or Extension first NOPE doesn't care
        //else {
        //    var targets = creep.room.find(FIND_STRUCTURES, {
        //            filter: (structure) => {
        //                return (structure.structureType == structure.structureType == STRUCTURE_CONTAINER) &&
        //                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        //            }
        //    });
        //    if(targets.length > 0) {
        //        if(creep.transfer(targets[1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //            creep.moveTo(targets[1], {visualizePathStyle: {stroke: '#ffffff'}});
        //        }
        //    }   
        //    
        //}
	}
};

module.exports = roleHeavyHarvester;