var roleTowerSoaker = {
    /** @param {Creep} creep **/
    run: function(creep) {
		// If the creep is not full health, heal itself
		if((creep.hits/creep.hitsMax) != 1)
		{
			creep.heal(creep);
		}
		
		// Covers room edge cases
		switch(creep.pos.x) {
			case 0: 
				creep.move(RIGHT);
				return;
			case 49: 
				creep.move(LEFT);
				return;
		}
		switch(creep.pos.y) {
			case 0:
				creep.move(BOTTOM);
				return;
			case 49: 
				creep.move(TOP);
				return;
		}

		
		//Creep needs a soakroom and a saferoom. Needs to go to saferoom first.
		if(creep.memory.wentToSafeRoom == undefined)
		{
			creep.memory.wentToSafeRoom = false;
		}
		
		else if(creep.room.name == creep.memory.safeRoom)
		{
			creep.memory.wentToSafeRoom = true;
		}
		if(creep.memory.wentToSafeRoom == false)
		{
			creep.moveTo(new RoomPosition(25, 25, creep.memory.safeRoom));
			return;
		}


		

		if(((creep.hits/creep.hitsMax) < 1) && creep.room.name == creep.memory.soakRoom)
		{
			creep.moveTo(new RoomPosition(25,25,creep.memory.safeRoom), {reusePath: 0});
		}
		else if((creep.hits/creep.hitsMax) == 1 )
		{
			creep.moveTo(new RoomPosition(2,19,creep.memory.soakRoom), {reusePath: 0});
		}


	}
};

module.exports = roleTowerSoaker;