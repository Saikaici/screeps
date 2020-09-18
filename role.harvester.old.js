var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        
	    if((creep.store.getUsedCapacity() == 0) ){
            creep.memory.harvesting = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }

        // Mining

        if(creep.memory.harvesting) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[creep.memory.assignedNode]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.assignedNode], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        //Drop off at closest empty container
        else if(creep.memory.harvesting == false){
            var nearTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_CONTAINER)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            if((creep.memory.assignedNode == 0) && (creep.pos == (new RoomPosition(35,45,'E47N27'))))
            {
                creep.moveTo(new RoomPosition(35,44,'E47N27'));
            }
            else if(nearTargets.length > 0) {
                if(creep.transfer(nearTargets[creep.memory.assignedNode], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(nearTargets[creep.memory.assignedNode], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
        // Dropping off or not mining. First priority is tower, extensions, then spawn, then containers. This is jank, I know.
            else{
                     {
                        console.log("Swapping to backup mode");
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_TOWER) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                        }
                    });
                    if(targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    else {
                        targets = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (( (structure.structureType == STRUCTURE_SPAWN )) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                            }
                        });
                    if(targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    
                
                    else {
                    targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (((structure.structureType == STRUCTURE_CONTAINER)) &&
                                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                        }
                    });
                    if(targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                
                }
        
            }   
        
                    
                }
            }
        }
    }
};

module.exports = roleHarvester;