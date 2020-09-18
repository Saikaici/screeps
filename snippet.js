'E47N27'
//Initial object initialization
Memory.rooms['E47N27'] = {};
//Memory.rooms[assignedRoom].initialPos = null;
Memory.rooms['E47N27'].roadsArray = [];
Memory.rooms['E47N27'].roadsCalculated = false;
Memory.rooms['E47N27'].roadsLaid = false;
Memory.rooms['E47N27'].roadsBuilt = false;
Memory.rooms['E47N27'].claimed = false;
Memory.rooms['E47N27'].reserved = false;
Memory.rooms['E47N27'].spawnPlaced = false;
Memory.rooms['E47N27'].spawnBuilt = false;
Memory.rooms['E47N27'].roomIntializationComplete = false;
Memory.rooms['E47N27'].sourceNodes = {};


Memory.rooms['E47N27'].sourceNodes = Game.rooms['E47N27'].find(FIND_SOURCES);



    Game.rooms['E47N27'].find(FIND_SOURCES);

Game.rooms['E47N27'].find(FIND_SOURCES, {
    filter: (source) => {
       return (([STRUCTURE_CONTAINER,STRUCTURE_LINK].includes(structure.structureType)) && (['33, 42','35, 42','35, 40','38, 20','37, 42'].includes(structure.pos.x+', '+structure.pos.y)) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    }});



var test = Memory.rooms;
test;


Memory.roomIDs = ['E47N27', 'E48N27'];
