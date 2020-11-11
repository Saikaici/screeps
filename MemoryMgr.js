var MemoryMgr = {

    // Takes a string of a room and refreshes it in memory
    /** @param {string} room **/
    updateRoom: function(room) {
        try {
            
        } catch (error) {
            
        }

    },

    //Gets all links in all rooms and updates their objects in memory. Does not need anything to do this
    ///** @param {string} creep **/
    updateLinks: function() {
        try {
            var tempLinks;
            var tempTypeFound;
            var roomIDs = Array.from(Object.keys(Memory.rooms));

            for(const room of roomIDs)
            {
                //delete the existing stuff first
                Memory.rooms[room].links = [];
                
                //Iterate through the links
                tempLinks = Game.rooms[room].find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_LINK }
                });
                for (let i = 0; i < tempLinks.length; i++) {
                    // Set up a case statement to check what object the link is next to. Options are room controller, storage, and source node.
                    tempTypeFound = false;
                    //tempLink = tempLinks[i].name;
                    if(!tempTypeFound)
                    {
                        if((tempLinks[i].pos.findInRange(FIND_STRUCTURES, 2, { filter: { structureType: STRUCTURE_STORAGE }})).length > 0)
                        {
                            Memory.rooms[room].links[i] = { id: tempLinks[i].id , linkType: 'both'};
                            //console.log(tempLinks[i].pos.findInRange(FIND_STRUCTURES, 2, { filter: { structureType: STRUCTURE_STORAGE }}))
                            //console.log('LinkType both found');
                            tempTypeFound = true;
                        }
                    }
                    if(!tempTypeFound)
                    {
                        if((tempLinks[i].pos.findInRange(FIND_SOURCES, 2)).length > 0)
                        {
                            Memory.rooms[room].links[i] = { id: tempLinks[i].id , linkType: 'sender'};
                            //console.log('LinkType sender found');
                            tempTypeFound = true;
                        }
                    }
                    if(!tempTypeFound)
                    {
                        //console.log(Game.rooms[room].controller);
                        var tempArray = [];
                        tempArray[0] = Game.rooms[room].controller;
                        if((tempLinks[i].pos.findInRange(tempArray, 2)).length > 0)
                        {
                            Memory.rooms[room].links[i] = { id: tempLinks[i].id , linkType: 'receiver'};
                            //console.log('LinkType receiver found');
                            tempTypeFound = true;
                        }
                    }
                    if(!tempTypeFound)
                    {
                        Memory.rooms[room].links[i] = { id: tempLinks[i].id , linkType: 'none'};
                        //console.log('LinkType none found');
                    }
                }
            }

        } catch (error) {
            console.log('Error updating Links into memory. Error:' + error.stack)
        }
    },

    //Gets all towers and updates their objects in memory. Does not need anything to do this
    ///** @param {string} creep **/
    updateTowers: function() {
        try {
            


        } catch (error) {
            
        }

    },

    //Gets all spawns and updates their objects in memory. Does not need anything to do this
    ///** @param {string} creep **/
    updateSpawns: function() {
        try {
            
        } catch (error) {
            
        }

    }


};

module.exports = MemoryMgr;