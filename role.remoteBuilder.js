var roleRemoteBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
		// assignedRoom should be id
		// Need to pass 'E47N27'

        //The purpose of this builder is to
		// A go to a different room, set an initial point because that's where we'll connect to the previous room
		// B Set up controller with a flag
		// B.1 set up construction sites for road between previous room and nodes in room (B.2 find nodes, B.3 set up road constructionsites)
		// C Gather minerals
        // D maintain those roads
		// 

		// Initialize memory.rooms if it doesn't exist
		const assignedRoom = creep.memory.assignedRoom;

		if(!Memory.rooms){
			Memory.rooms = {};
		}

		//variable initialization
		if(!Memory.rooms[assignedRoom])
		{
			//Initial object initialization
			Memory.rooms[assignedRoom] = {};
			//Memory.rooms[assignedRoom].initialPos = null;
			Memory.rooms[assignedRoom].roadsArray = [];
			Memory.rooms[assignedRoom].roadsCalculated = false;
			Memory.rooms[assignedRoom].roadsLaid = false;
			Memory.rooms[assignedRoom].roadsBuilt = false;
			Memory.rooms[assignedRoom].claimed = false;
			Memory.rooms[assignedRoom].spawnPlaced = false;
			Memory.rooms[assignedRoom].spawnBuilt = false;
			Memory.rooms[assignedRoom].roomIntializationComplete = false;
			Memory.rooms[assignedRoom].sourceNodes = {};
		}


		// State information
		if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('I require more minerals');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 Constructing additional pylons');
		}
		

		// Part A
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
		else if (!Memory.rooms[assignedRoom].initialPos) {
			Memory.rooms[assignedRoom].initialPos = creep.pos;
		}
		

		
		// Part B
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		//
		else if((Memory.rooms[assignedRoom].claimed == false) && (creep.room.controller != null)) {
			
			if(creep.signController(creep.room.controller, 'Beware Wild Ducks') == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller);
			}
			//When this is done, set claimed flag for the room to true so this portion doesn't execute anymore
			if(creep.room.controller.sign.text == 'Beware Wild Ducks')
			{
				Memory.rooms[assignedRoom].claimed = true;
			}

		}
		
		

		// Start with initial location into room (defined in part A as Memory.rooms[assignedRoom].intialPos), then build roads to nodes, then build roads to room controller
		// Lay roads first
		else if(Memory.rooms[assignedRoom].roadsCalculated == false)
		{
			console.log(creep.room.find(FIND_SOURCES));
			
			// An array that contains the energy sources of the room
			var sourceArray = creep.room.find(FIND_SOURCES);
			Memory.rooms[assignedRoom].sourceNodes = sourceArray;
			
			var initialPos = new RoomPosition(Memory.rooms[assignedRoom].initialPos.x, Memory.rooms[assignedRoom].initialPos.y, assignedRoom);
			// An array that contains a temporary path variable that will be added to final roads array
			//var pathArray = [];
			var pathTemp = [];
			var roadsArray = [];
			// Room controller = creep.room.controller

			//Get ready for monster "for loops"
			//Start with going between nodes and Memory.rooms[assignedRoom].initialPos
			
			// i = nodes index, j = path step index
			for(i = 0; i < sourceArray.length; i++)
			{
				
				//console.log(initialPos);
				//Creates a serialized path object in the assigned room between the initial position that the room was first entered into to  
				//Note: pathTemp SHOULD be an array of objects. If not... RIP
				pathTemp = Game.rooms[assignedRoom].findPath(initialPos,(sourceArray[i].pos), ignoreCreeps = true, ignoreRoads = true, serialize = true);
				//console.log(pathTemp);
				//console.log('hi');
				for(j = 0; j < pathTemp.length; j++) // j corresponds to the length
				{
					// Check if the x and y are included in the roadsArray. If they aren't, add them.
					if(!roadsArray.includes(new RoomPosition(pathTemp[j].x, pathTemp[j].y, assignedRoom))) {
						roadsArray.push(new RoomPosition(pathTemp[j].x, pathTemp[j].y, assignedRoom));
					}
				}
				//console.log(roadsArray);
			}
			
			//We also need to build roads between the sources and the Room controller
			for(i = 0; i < sourceArray.length; i++)
			{
				
				pathTemp = Game.rooms[assignedRoom].findPath(creep.room.controller.pos,(sourceArray[i].pos), ignoreCreeps = true, ignoreRoads = true, serialize = true);
				console.log(pathTemp);
				// Take the path and iterate through it, adding the coordinates the the list of squares that need roads.
				for(j = 0; j < pathTemp.length; j++)
				{
					//console.log(i +' '+ j);
					// Check if the x and y are included in the roadsArray. If they aren't, add them.
					if(!roadsArray.includes(new RoomPosition(pathTemp[j].x, pathTemp[j].y, assignedRoom))) {
						roadsArray.push(new RoomPosition(pathTemp[j].x, pathTemp[j].y, assignedRoom));

					}
				}
				//console.log(roadsArray);

			}
			//roadsCalculated is complete, set it true so it skips this step in the future.
			Memory.rooms[assignedRoom].roadsArray = roadsArray;
			Memory.rooms[assignedRoom].roadsCalculated = true;
			// Game.rooms['E47N27'].findPath(new RoomPosition(25,25,'E47N27'),new RoomPosition(30,30,'E47N27'), serialize = true)

			//Memory.rooms[assignedRoom].roadToNodes = creep.room.findPath(creep.room.findPath(creep.pos), )
			//Memory.rooms[assignedRoom] = true;
		}

		//Now that roads are calculated where they need to go, make construction objects for all of them
		else if(Memory.rooms[assignedRoom].roadsLaid == false && Memory.rooms[assignedRoom].roadsArray.length > 0){
			//Set construction sites for all
			var roadsArray = Memory.rooms[assignedRoom].roadsArray;
			console.log(roadsArray);
			for(i = 0; i < roadsArray.length; i++)
			{	
				//Create contruction sites for all objects
				creep.room.createConstructionSite(roadsArray[i].x, roadsArray[i].y, STRUCTURE_ROAD);
			}
			//Now roads have been laid
			Memory.rooms[assignedRoom].roadsLaid = true;
			Memory.rooms[assignedRoom].roomIntializationComplete = true;

		}


		//Now for the fun part of getting minerals from a node, 
		else if(creep.memory.building && Memory.rooms[assignedRoom].roomIntializationComplete) {
			//Find closest structure to build first
			var closestConstructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
			
            //we need the .pos of the targets, create new array and store them in there
			var closestConstructionSitePos = [closestConstructionSites.length];
			for(i = 0; i < closestConstructionSites.length; i++)
			{
			    closestConstructionSitePos[i] = closestConstructionSites[i].pos;
			}
			
			var closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: (ConstructionSite) => { return ConstructionSite.structureType == STRUCTURE_ROAD}}, closestConstructionSitePos);
			// Now build the closest constructionsite
			if(closestConstructionSite) {
				if(creep.build(closestConstructionSite) == ERR_NOT_IN_RANGE) {
				creep.moveTo(closestConstructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
			// This is where I need to add repairing functions to the builder.	
		}
		// Part C
        //-----------------------------------------------------------------------------------------------------------------------------------------------------------
		// If not building, it needs to harvest from the nearest node
		else if(!creep.memory.building && Memory.rooms[assignedRoom].sourceNodes) {
			var closestNode = creep.pos.findClosestByPath(FIND_SOURCES, {filter: (node) => { return node}}, Memory.rooms[assignedRoom].sourceNodes);
            if(creep.harvest(closestNode) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestNode, {visualizePathStyle: {stroke: '#ffaa00'}});
            }

		}
		
	}
};

module.exports = roleRemoteBuilder;