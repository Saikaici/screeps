var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {


        // Memory should have an assignedNodeID (Should be the actual node object ID in the room it's mining)
        var assignedNode = Game.getObjectById(creep.memory.assignedNodeID);
        
        //Creates a creep.memory.assignedRoom if it does not exist. This greatly simplifies other counting code.
        if(creep.memory.assignedRoom == undefined)
        {
            creep.memory.assignedRoom = assignedNode.room;
        }


	    if((creep.store.getUsedCapacity() == 0) ){
            creep.memory.harvesting = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }


        //Do mining
        if(creep.memory.harvesting) {
            if(creep.harvest(assignedNode) == ERR_NOT_IN_RANGE) {
                creep.moveTo(assignedNode, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }

        //Deliver to nearest container
        else if(!creep.memory.harvesting)
        {
            //Finds nearest container. Delivers to it.
            var deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            }});
            //Prioritize delivering to spawn/extensions
            if(!deliveryTarget) {
                deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_SPAWN) || (structure.structureType == STRUCTURE_EXTENSION)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                }});
            }
            //Deliver to storage if no nodes available.
            if(!deliveryTarget) {
                deliveryTarget = creep.room.storage;

            }
            //If still no container or storage, deliver it to anything with free energy storage
            if(!deliveryTarget) {
                deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                }});
            }

            //Tell it to deliver it if it can find a target
            if((creep.deposit(deliveryTarget) == ERR_NOT_IN_RANGE) && deliveryTarget) {
                creep.moveTo(deliveryTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else {
                console.log('No free storage in ' + creep.room.name);
            }
            
        }
    }
};

module.exports = roleHarvester;