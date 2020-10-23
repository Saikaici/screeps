var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {


        // Memory should have an assignedNodeID (Should be the actual node object ID in the room it's mining)
        var assignedNode = Game.getObjectById(creep.memory.assignedNodeID);
        //var assignedRoom = assignedNode.room;
        //console.log(assignedNode);

        //A game ID of the link that the harvester gets assigned to.
        var depositLink;
        
        
        //If the harvester is proximate to a link, it needs to prioritize that first.
        //Set up a variable that changes how the harvester acts
        if(creep.memory.nodeNextToLink == undefined)
        {
            //creates a piece of memory that will be checked in deposit targets
            //creep.memory.nodeNextToLink = false;
            //console.log(creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}}));
            for(var link of creep.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}})) {
                //console.log(link);
                if(assignedNode.pos.inRangeTo(link.pos, 1))
                {
                    depositLink = link.id;
                    creep.Memory.creepNextToLink = true;
                }
            
            }
        }
        

       //room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});

	    if((creep.store.getUsedCapacity() == 0) ){
            creep.memory.harvesting = true;
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }


        //Do mining
        if(creep.memory.harvesting) {
            if(creep.harvest(assignedNode) == ERR_NOT_IN_RANGE) {
                creep.moveTo(assignedNode.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }

        //Deliver to nearest container
        else if(!creep.memory.harvesting)
        {
            var deliveryTarget;
            //If next to a link, deposit into it. Always. It's not moving. It'll waste way too much time moving to other storage if it has a link.
            if(creep.memory.nodeNextToLink)
            {
                deliveryTarget = Game.getObjectById(depositLink);
            }

            //Finds nearest container or storage. Delivers to it.
            if(!deliveryTarget) {
                deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_CONTAINER) || (structure.structureType == STRUCTURE_STORAGE)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                }});
            }  
            //Prioritize delivering to spawn/extensions
            if(!deliveryTarget) {
                deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_SPAWN) || (structure.structureType == STRUCTURE_EXTENSION)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                }});
            }
            /*
            //Deliver to storage if no nodes available.
            if(!deliveryTarget) {
                deliveryTarget = creep.room.storage;

            }
            */
            //If still no container or storage, deliver it to anything with free energy storage
            if(!deliveryTarget) {
                try {
                deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                    return (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                }});
                }
                catch (error) {
                    //This is because you have to for the try block
                }
            }

            //Tell it to deliver it if it can find a target
            if(((creep.transfer(deliveryTarget, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) && deliveryTarget) {
                creep.moveTo(deliveryTarget.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if(!deliveryTarget){
                console.log('No free storage in ' + creep.room.name);
            }
            
        }
    }
};

module.exports = roleHarvester;