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
            //console.log('creep assigned room: '+ creep.memory.assignedRoom);
        }
        //Go to the assigned room if it isn't there
        else if(creep.room.name != creep.memory.assignedRoom) {
            var roomMove = new RoomPosition(25,25,creep.memory.assignedRoom);
            creep.moveTo(roomMove); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
        }
        //Once it's in it's assigned room, it generates a list of containers closest to the source node
        else if(!creep.memory.removalContainersID)
        {
            var removalContainers = [];
            //If removalContainers don't exist, we want to get them and then store them, only when a creep is generated though
            var sources = creep.room.find(FIND_SOURCES);
            //console.log('sources length: ' + sources.length);
            var tempNode;
            
            for(i = 0; i < sources.length; i++)
            {
                tempNode = sources[i];
                tempTarget = tempNode.pos.findClosestByRange(creep.room.find(FIND_STRUCTURES, {filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER)}}));
                //Using range because it's cheaper, plus these containers SHOULD be right next to the nodes
                
                if(tempTarget != undefined)
                {
                    removalContainers[i] = tempTarget.id;
                }
                //console.log('tempnode: '+ tempTarget);
                //console.log('removalcontainer['+ i + '] ' + removalContainers[i]);
                
            }
            
            creep.memory.removalContainersID = removalContainers;
            //console.log('removalContainers' + removalContainers)
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
            //console.log('delivering to places');
            //-----------------------------------------------------------------------------------
            //First priority is Spawn and Extensions

            //Second priority is towers

            //Third priority is storage


            //Prioritize delivering to spawn/extensions
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

            
            if(!deliveryTarget) {
                //console.log('1st delivery target checkpoint' + deliveryTarget);

                tempTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_TOWER) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 180)) }});
                if(tempTarget != null)
                {
                    deliveryTarget = tempTarget;
                }
                { filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCES_ALL) > 50) }}
                //{ filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCES_ALL) > 50) }}
                //console.log(' tower' +deliveryTarget);
            }
            //Code commented out because transporters never need to deliver to links
            /*
            if(!deliveryTarget) {
                //console.log('2nd delivery target checkpoint, links' + deliveryTarget);

                tempTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_LINK) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200)) }});
                if(tempTarget != null)
                {
                    deliveryTarget = tempTarget;
                }
                //{ filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCES_ALL) > 50) }}
                //{ filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCES_ALL) > 50) }}
                //console.log(' link' +deliveryTarget);
            }
            */
            //Deliver to room's terminal if no nodes available.
            if(!deliveryTarget) {
                //console.log('2nd delivery target checkpoint, links' + deliveryTarget);

                tempTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_TERMINAL) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)) }});
                if(tempTarget != null)
                {
                    deliveryTarget = tempTarget;
                }
            }
            
            //Deliver to storage if no nodes available.
            if(!deliveryTarget) {
                if(creep.room.storage != undefined)
                {
                    //console.log('3rd delivery target checkpoint, storage');
                    if(creep.room.storage.store.getFreeCapacity() > 0)
                    {
                        deliveryTarget = creep.room.storage;
                    }
                }
                //console.log('storage' +deliveryTarget);
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
                    console.log('No deliveryTarget');
                }
            }

            //console.log('delivering final target' + deliveryTarget)
            //Tell it to deliver if there's a target
            if(deliveryTarget)
            {
                if(((creep.transfer(deliveryTarget, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) && deliveryTarget) {
                    creep.moveTo(deliveryTarget.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else if(!deliveryTarget){
                console.log('No free storage in ' + creep.room.name);
            }
            //-----------------------------------------------------------------------------------

        }
        //If it's not transporting, it needs to find containers to get stuff from
        else if(!creep.memory.transporting)
        {
            //console.log('gathering from places');
            //Get energy from the nearest container that has enough energy to fill the creep.
            var collectionTarget;
            maxEnergyCheck = creep.store.getCapacity(RESOURCE_ENERGY);
            //console.log('tombstones: ' + tombstones);
            //console.log('before loop:'+collectionTarget);
            //if(tombstones.length > 0)
            //if(tombstones.length > 0)
            //{
                //collectionTarget = creep.pos.findClosestByPath(FIND_TOMBSTONES, tombstones);
            //}
            
            //If the room's available storage for creeps is empty, then it needs to use storage directly to fill the extensions and spawn
            if((collectionTarget == undefined && creep.room.storage != undefined))
            {
                if((creep.room.energyAvailable/creep.room.energyCapacityAvailable) < .75 && creep.room.storage.store.getUsedCapacity > maxEnergyCheck)
                {
                    collectionTarget = creep.room.storage;
                }
            }
            //Collect from removal containers
            if(collectionTarget == undefined)
            {   
                var removalContainers = [];

                for(var i in creep.memory.removalContainersID)
                {
                    removalContainers[i] = Game.getObjectById(creep.memory.removalContainersID[i]);
                }
                //Find a removal container to pull energy from
                //console.log("Get containers and check if they have enough" + creep.pos.findClosestByRange(removalContainers, { filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck) }}));
                /* if(creep.pos.findClosestByRange((removalContainers, { filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck) }})) == null)
                {
                    collectionTarget = creep.room.storage;
                }
                */
                
                if(creep.memory.removalContainersID)
                {
                    collectionTarget = creep.pos.findClosestByPath(removalContainers, { filter: (structure) => { return (structure.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck) }})
                }
                //Force collection Target to be storage on occassion
                //collectionTarget = creep.room.storage;
                //console.log(collectionTarget);
            }
            //Links need to be added eventually
            
            if(collectionTarget == undefined)
            {   
                for (const link of Memory.rooms[creep.room.name].links) 
                {
                    //Check if link is in the same room as the creep.

                    //console.log(link);
                    
                    if((Game.getObjectById(link.id).room == creep.room) && (link.linkType == 'both') && (Game.getObjectById(link.id).store.getUsedCapacity(RESOURCE_ENERGY) > 400))
                    {
                        collectionTarget = Game.getObjectById(link.id);
                        console.log('withdrawing from '+ link.id + ' in room ' + creep.room);
                    }
                }
            }

            if(collectionTarget == undefined)
            {
                if(creep.room.storage != undefined)
                {
                    if(creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck)
                    {
                        collectionTarget = creep.room.storage;
                    }
                }
            }

            if((collectionTarget == undefined) && (creep.room.terminal != undefined))
            {
                //console.log('checking terminal for resources')
                if((creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck) && ((creep.room.energyAvailable/creep.room.energyCapacityAvailable) < 1))
                {
                    collectionTarget = creep.room.terminal;
                    //console.log('setting terminal as target')
                }
            }
            
            //console.log(collectionTarget);
            //Go collect the collectionTarget

            if(collectionTarget != undefined)
            {
                /*
                if(creep.room == 'E49N29')
                {
                    console.log('collectiontarget' + collectionTarget);
                }
                */

                if(((creep.withdraw(collectionTarget, RESOURCE_ENERGY)) == ERR_NOT_IN_RANGE) && collectionTarget) {
                    creep.moveTo(collectionTarget.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else if(!collectionTarget){
                
                console.log('Nothing to collect in ' + creep.room.name);
            }
        }

        
    }

};

module.exports = roleTransporter;