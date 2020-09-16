var roleRemoteClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //Goal is to 
        // A - Go claim a room. This does not do anything else.


		// Initialize memory.rooms if it doesn't exist
		const assignedRoom = creep.memory.assignedRoom;

		//variable initialization
		if(!Memory.rooms[assignedRoom] == undefined)
		{
			Memory.rooms[assignedRoom].claimed = false;
		}
		

		// Go to the assigned room. Get out of nasty edge cases
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		if(creep.room.name != assignedRoom) {
			creep.moveTo(new RoomPosition(25,25,assignedRoom)); // It won't go to 25,25 but it'll tell it to go there and once it's in the room this piece will no longer execute)
		}
		// Lots of awful edge cases around 0,1,48,49 room spots
		else if(creep.pos.x == 0) {
			creep.move(RIGHT);
		}
		else if(creep.pos.x == 49) {
			creep.move(LEFT);
		}
		else if(creep.pos.y == 0) {
			creep.move(BOTTOM);
		}
		else if(creep.pos.y == 49) {
			creep.move(TOP);
		}
		else if((creep.pos.x || creep.pos.y) == (1 || 48))
		{
			creep.moveTo(new RoomPosition(25,25,assignedRoom));
		}
		

		
		// Claim the controller if it hasn't been claimed
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		//
		else if(!creep.room.controller.my) {
			creep.moveTo(creep.room.controller);
			if(creep.signController(creep.room.controller, 'Beware of Wild Ducks') == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller);
			}
			else if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller);
			}
			//When this is done, set claimed flag for the room to true so this portion doesn't execute anymore
			if(creep.room.controller.sign.text == 'Beware of Wild Ducks')
			{
				creep.signController(creep.room.controller, 'Beware of Wild Ducks')
				Memory.rooms[assignedRoom].claimed = true;
			}

		}

		else if(creep.room.controller.my && (creep.room.name == assignedRoom))
		{
			console.log('job done here, ending it now')
			//creep.suicide();
		}


	}
};

module.exports = roleRemoteClaimer;