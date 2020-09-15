var roleBuilder = {

	// delete all sites in room:
	//for( var site of (Game.rooms['E48N27'].find(FIND_CONSTRUCTION_SITES)) ){site.remove()}

    /** @param {Creep} creep **/
    run: function(creep) {

		//creep.moveTo(40,19);
		
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
			}
			else {
			    targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
							return (structure.structureType == STRUCTURE_CONTAINER || (structure.structureType == STRUCTURE_WALL && structure.hits < 5000) || (structure.structureType == STRUCTURE_RAMPART && structure.hits < 1000)) &&
							structure.hits < structure.hitsMax;
					}
					
			    });
			    
			    if(targets.length) {
				    if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
				    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		}



		}
		//Otherwise, if not building, then go get resources
	    else {
	        // If there are still items to build, get from containers first

				var targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_STORAGE &&
							structure.store.getCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				//console.log(targets[0].id);
				if(targets.length > 0) {
					if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			
	        
	        //Go mine if no items have energy to pull
	        //var sources = creep.room.find(FIND_SOURCES);
            //if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            //    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            //}
		}
		
		
		
	}
};

module.exports = roleBuilder;