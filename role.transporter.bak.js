var roleTransporter= {

    // Creep job is to distribute from containers ONLY to spawn, extenders, and other containers. 

    /** @param {Creep} creep **/
    run: function(creep, removalContainers, depositContainersEnter) {
        //console.log('transporter start ' + depositContainersTest);
        var depositContainers = depositContainersEnter;
        //console.log(depositContainers);
        // If full, set to a delivering state. If not, will be gathering
        
        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.transporting = false;
        }
        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.transporting = true;
        }
        //var idle = false;
        
        //optimally this would be a global variable so that it's not being constantly searched for.
        var tombstones = creep.room.find(FIND_TOMBSTONES, { filter: (tombstone) => {
            return (tombstone.store.getUsedCapacity() > 0);
        }});

        //Initial targets for the alpha contstructor
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_EXTENSION || ((structure.structureType == STRUCTURE_TOWER) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 180)) || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
            }
        });

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


        else if(creep.memory.transporting && creep.memory.alphaTransporter && (targets.length > 0)){
            //Prioritize cannon deliveries, then extenders, then spawn. Straight lifted from Harvester code.
            
            // targets are defined above
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
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