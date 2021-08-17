var rolePanicCreep= {

    // Creep job is to distribute from containers ONLY to spawn, extenders, and other containers. 

    /** @param {Creep} creep **/
    run: function(creep) {
        //Creep will check if it is full and stop or start mining
	    if((creep.store.getUsedCapacity() == 0) ){
            creep.memory.harvesting = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
            if(creep.memory.miningTarget)
            {
                delete creep.memory.miningTarget;
            }
        }

        //Creep will go get target to mine

        if(creep.memory.harvesting) {

            if(creep.memory.miningTarget == undefined)
            {
                creep.memory.miningTarget = (creep.pos.findClosestByPath(FIND_SOURCES)).id;
            }

            if(creep.harvest(Game.getObjectById(creep.memory.miningTarget)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.miningTarget).pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }

        //Creep will deposit it in nearest extension or spawn.
        else if(!creep.memory.harvesting)
        {
            var deliveryTarget = undefined;
            //var creepMaxEnergy = creep.store.getCapacity;
            var tempTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                return (((structure.structureType == STRUCTURE_SPAWN) || (structure.structureType == STRUCTURE_EXTENSION)) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            }});

            if(tempTarget != null)
            {
                deliveryTarget = tempTarget;
            }

            if(deliveryTarget)
            {
                if(((creep.transfer(deliveryTarget, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) && deliveryTarget) {
                    creep.moveTo(deliveryTarget.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
        
    }
};

module.exports = rolePanicCreep;