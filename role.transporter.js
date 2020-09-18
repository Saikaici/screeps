var roleTransporter= {

    // Creep job is to distribute from containers ONLY to spawn, extenders, and other containers. 

    /** @param {Creep} creep **/
    run: function(creep, removalContainers, depositContainersEnter) {
        //console.log('transporter start ' + depositContainersTest);
        var depositContainers = depositContainersEnter;
        //console.log(depositContainers);
        // If full, set to a delivering state. If not, will be gathering
        

        if(creep.room.name != creep.memory.assignedRoom) {
            creep.moveTo(new RoomPosition(25,25,creep.memory.assignedRoom)); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
        }

        

        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.transporting = false;
        }
        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.transporting = true;
        }
        //var idle = false;
        
        //optimally this would be a global variable so that it's not being constantly searched for.
        var tombstones = creep.room.find(FIND_TOMBSTONES, { filter: (tombstone) => {
            return (tombstone.store.getUsedCapacity() > 50);
        }});

        //Initial targets for the alpha constructor
        if(creep.memory.transporting) {
            var alphaTargets = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION || ((structure.structureType == STRUCTURE_TOWER) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 180)) || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            }); 
            /*
            var alphaTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_EXTENSION || ((structure.structureType == STRUCTURE_TOWER) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 180)) || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            */

        }
        //Grab from containers that are passed as an array of structures
        if(creep.memory.transporting == false) {  
        //console.log(removalContainers);   
        
        //removalContainers.forEach(element => (element.getUsedCapacity(RESOURCE_ENERGY))/(element.getCapacity(RESOURCE_ENERGY)) > (target.getUsedCapacity(RESOURCE_ENERGY))/(target.getCapacity(RESOURCE_ENERGY))); { target = element};
        //console.log(target);
        
        //console.log(tombstones);
        //return ( ['RESOURCE_ENERGY','RESOURCE_GHODIUM','RESOURCE_KEANIUM','RESOURCE_UTRIUM','RESOURCE_ZYNTHIUM'].includes(tombstone.store.getUsedCapacity > 0));
        if(tombstones.length > 0 && creep.memory.tombstoneTransporter == true) {
            var tombClose = false;
            if(creep.withdraw((tombstones[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE))  {
                tombClose = false;
                creep.moveTo(tombstones[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else{
                tombClose = true;
            }
            //gather dropped resources
            
            //creep.withdraw(tombstones[0], RESOURCE_ENERGY||RESOURCE_GHODIUM||RESOURCE_KEANIUM||RESOURCE_UTRIUM||RESOURCE_ZYNTHIUM) == ERR_NOT_IN_RANGE)) {
            if(creep.withdraw(tombstones[0], RESOURCE_GHODIUM) == ERR_NOT_ENOUGH_RESOURCES) {
                if(creep.withdraw(tombstones[0], RESOURCE_ZYNTHIUM) == ERR_NOT_ENOUGH_RESOURCES) {
                    if(creep.withdraw(tombstones[0], RESOURCE_UTRIUM) == ERR_NOT_ENOUGH_RESOURCES) {
                        if(creep.withdraw(tombstones[0], RESOURCE_KEANIUM) == ERR_NOT_ENOUGH_RESOURCES) {
                            creep.withdraw(tombstones[0], RESOURCE_ENERGY);
                            
                        }
                    }
                }
            }
        }
        else if(((creep.room.energyAvailable)/(creep.room.energyCapacityAvailable) < 1) && (creep.memory.alphaTransporter == true)) {
            //If it's the alpha transporter, it can withdraw from whatever it needs to fill the extensions for further spawning.
            var maxEnergyCheck = creep.store.getCapacity(RESOURCE_ENERGY);
            var target =  creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (((structure.structureType == STRUCTURE_STORAGE) || (structure.structureType == STRUCTURE_CONTAINER)) && (structure.store.getUsedCapacity(RESOURCE_ENERGY) > maxEnergyCheck));
                }
            });
            //console.log('Gather target:' + maxEnergyCheck);
            //console.log('Gather target:' + target);
            if(target != null) {
                if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            }
        

        // if no dropped resources, do all the normal collection things.
        else {
            var target = removalContainers[0];

            for(var i = 0; i<removalContainers.length; i++) {
                //target.getUsedCapacity(RESOURCE_ENERGY))/(target.getCapacity(RESOURCE_ENERGY))
                //console.log(removalContainers[i]);
                if(((removalContainers[i].store.getUsedCapacity(RESOURCE_ENERGY))/(removalContainers[i].store.getCapacity(RESOURCE_ENERGY))) > ((target.store.getUsedCapacity(RESOURCE_ENERGY))/(target.store.getCapacity(RESOURCE_ENERGY)))) {
                    target = removalContainers[i];
                }

                if(target != null) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        } 
        }
        //END OF GATHERING CODE


        else if(creep.memory.transporting && creep.memory.alphaTransporter && alphaTargets){
            //Prioritize cannon deliveries, then extenders, then spawn. Straight lifted from Harvester code.
            
            // targets are defined above
                if(alphaTargets) {
                    if(creep.transfer(alphaTargets, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(alphaTargets, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }

        else if((creep.store[RESOURCE_GHODIUM||RESOURCE_KEANIUM||RESOURCE_UTRIUM||RESOURCE_ZYNTHIUM] > 0) && creep.memory.tombstoneTransporter && creep.memory.transporting) {
            var targets = creep.room.storage;
            console.log(targets[0]);
            if(targets.length > 0) {
                if(creep.transfer(targets[0], [RESOURCE_ENERGY||RESOURCE_GHODIUM||RESOURCE_KEANIUM||RESOURCE_UTRIUM||RESOURCE_ZYNTHIUM]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0].pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        else if(creep.memory.transporting) {
            //console.log('transporter end ' + depositContainers);
            if(depositContainers.length > 0) {
                if(creep.transfer(depositContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(depositContainers[0], {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                        //Drop it in the Storage node for the room
                        else if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
        }
        
    }

};

module.exports = roleTransporter;