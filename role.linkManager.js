var rolelinkManager= {

    // Creep job is to distribute from containers ONLY to spawn, extenders, and other containers. 

    /** @param {Creep} creep **/
    run: function(creep) {

        //Needs an assignedlink, the type of link it is (receiever, sender, both), it's spawnInfo,  and a spawnRoom

        //Creep memory:
        /*
        Creep role specific assignments
        ---
        var full = bool
        var linkID = {string};
        var linkType = {string};    //(receiver, sender, both, none)
        var linkpos = {position};
        var creepPos = {position};
        var currentTarget = objectID;
        var currentTargetAction = {string} //For BOTH mode, it'll be responsible to transfer/withdraw as needed

        Creep overall memory objects
        ---
        var assignedRoom = {string};
        var spawnRoom = {string};
        var spawnInfo = {spawnInfo};
        var scheduledRespawn = bool;
        var respawnIfKilled = bool; //This may be a temporary creep, if it is killed early it is fine
        var sleepUntil = number; //orders this creep to sleep until this Game.time
        var deathTime = number;
        */
        
        //creep.scheduleRespawn()

        //Creep size should always be 4 CARRY, 2 MOVE parts. 300 Total. It means it takes 4 ticks to fully empty/fill a link while next to storage

        if(creep.memory.creepPos != creep.pos)
        {
            creep.moveTo(creepPos);
        }


        //Set state of gathering or emptying. Also resets the target
        if(creep.store.getFreeCapacity() == 0)
        {
            creep.memory.full = true;
            delete creep.memory.currentTarget;
        }
        else if(creep.store.getUsedCapacity() == 0)
        {
            creep.memory.full = false;
            delete creep.memory.currentTarget;
        }

        //If it does not have a current target, it will run the logic to get one
        if(creep.memory.currentTarget == null)
        {
            //Logic for delivery to targets
            if(creep.memory.full == true)
            {
                switch(creep.memory.linkType) {
                    case 'sender':
                        //In this case, it will target the link
                        creep.memory.currentTarget = Game.getObjectByID(creep.memory.linkID);
                        break
                    case 'receiver': 
                        //In this case, it will target the storage
                        creep.memory.currentTarget = creep.room.storage;
                        break
                    case 'both':
                        delete creep.memory.currentTarget;
                        console.log('Support for a BOTH link is not implemented yet ' + creep.name);
                        break
                    default:
                        delete creep.memory.currentTarget;
                        console.log('No linkManager linkType defined for creep: ' + creep.name);
                        break
                }
            }
            //Logic for acquiring from nearby targets
            else if(creep.memory.full == false)
            {
                switch(creep.memory.linkType) {
                    case 'receiver': 
                        //In this case, it will acquire energy from the link
                        creep.memory.currentTarget = Game.getObjectByID(creep.memory.linkID);
                        break
                    case 'sender':
                        //In this case, it will acquire energy from the storage
                        creep.memory.currentTarget = creep.room.storage;
                        break
                    case 'both':
                        delete creep.memory.currentTarget;
                        console.log('Support for a BOTH link is not implemented yet ' + creep.name);
                        break
                    default:
                        delete creep.memory.currentTarget;
                        console.log('No linkManager linkType defined for creep: ' + creep.name);
                        break
                }
            }
        }

        //If there is a target, do what it needs to
        if(creep.memory.currentTarget)
        {
            if(currentTargetAction == 'transfer')
            {
                creep.transfer(creep.memory.currentTarget, RESOURCE_ENERGY);
            }
            else if(currentTargetAction == 'withdraw')
            {
                creep.withdraw(creep.memory.currentTarget, RESOURCE_ENERGY);
            }
        }
    }
};

module.exports = rolelinkManager;