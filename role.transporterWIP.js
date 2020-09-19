var roleTransporter= {

    // Creep job is to distribute from containers ONLY to spawn, extenders, and other containers. 

    /** @param {Creep} creep **/
    run: function(creep) {
        //If this is setup, it'll jump out of this statement, otherwise it'll set up other memory objects and go to the room it needs to be in.
        if(creep.memory.setup == true)
        {
            
        }
        //If the creep does not have memory of an assignedroom, assign it to the room it's in
        else if(creep.memory.assignedRoom == undefined)
        {
            creep.memory.assignedRoom = creep.room.name;
        }
        //Go to the assigned room if it isn't there
        else if(creep.room.name != creep.memory.assignedRoom) {
            creep.moveTo(new RoomPosition(25,25,creep.memory.assignedRoom)); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
        }
        //Once it's in it's assigned room, it generates a list of containers closest to the source node
        else if(creep.memory.removalContainers == undefined)
        {
            var removalContainers = [];
            //If removalContainers don't exist, we want to get them and then store them, only when a creep is generated though
            var sources = creep.room.find(FIND_SOURCES);
            var tempNodePos;
            for(i = 0; i > sources.length; i++)
            {
                tempNodePos = sources[i].pos;
                //Using range because it's cheaper, plus these containers SHOULD be right next to the nodes
                removalContainers[i] = tempNodePos.findClosestByRange(creep.room.find(FIND_STRUCTURES, {filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER)}}));
            }
            //This should technically be stored by ID, but IDC because I only need position and that's not changing
            creep.memory.removalContainers = removalContainers;
        }
        else
        {
            creep.memory.setup = true;
        }

        // Normal checks for whether it's transporting or not
        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.transporting = false;
        }
        else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.transporting = true;
        }
        
        //If it's transporting, then it needs to find where it needs to put stuff
        if(creep.memory.transporting)
        {
            //-----------------------------------------------------------------------------------
            //First priority is Spawn and Extensions

            //Second priority is towers

            //Third priority is storage


            //Prioritize delivering to spawn/extensions
            var deliveryTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                return (((structure.structureType == STRUCTURE_SPAWN) || (structure.structureType == STRUCTURE_EXTENSION)) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            }});
            if(!deliveryTarget) {
                deliveryTarget = creep.room.findClosestByPath(STRUCTURE_TOWER);
            }
            //Deliver to storage if no nodes available.
            else if(!deliveryTarget) {
                deliveryTarget = creep.room.storage;
            }
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
            //-----------------------------------------------------------------------------------

        }
        //If it's not transporting, it needs to find containers to get stuff from
        else if(!creep.memory.transporting)
        {
            //Get energy from the nearest container that has enough energy to fill the creep.
            var collectionTarget;
            maxEnergyCheck = creep.store.getCapacity(ENERGY_RESOURCE);
            var tombstones = creep.room.find('FIND_TOMBSTONES', { filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCES_ALL) > 50) }});

            if(tombstones)
            {
                collectionTarget = creep.pos.findClosestByPath('FIND_TOMBSTONES', tombstones);
            }
            //Collect from removal containers
            else if(!collectionTarget)
            {   
                //Find a removal container to pull energy from
                collectionTarget = creep.pos.findClosestByPath(STRUCTURE_CONTAINER, removalContainers, { filter: (structure) => { return (structure.store.getFreeCapacity(RESOURCE_ENERGY) > maxEnergyCheck) }})
            }
        
            //Links need to be added eventually

            //Go collect the collectionTarget
            if(((creep.withdraw(collectionTarget, RESOURCES_ALL)) == ERR_NOT_IN_RANGE) && collectionTarget) {
                creep.moveTo(collectionTarget.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else if(!collectionTarget){
                //console.log('Nothing to collect in ' + creep.room.name);
            }
        }

        
    }

};

module.exports = roleTransporter;