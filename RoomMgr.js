var RoomMgr = {

    // Takes a string of a room and refreshes it in memory
    /** @param {object} variables  **/
    operateLinks: function(room) {
        try {
            //console.log(Memory.rooms[room].links);
            var links = Memory.rooms[room].links;
            //console.log(links.length);
            var senders = [];
            var both = [];
            var receivers = [];
            var sendToReceiverThreshold = 200;
            //(receiver, sender, both, none)
            // Categorize the links

            for(let link of links)
            {
                //console.log(link.linkType);
                if(link.linkType == 'sender')
                {
                    //console.log('senders count: ' + Game.getObjectById(link.id));
                    senders.push(Game.getObjectById(link.id));
                }
                else if(link.linkType == 'both')
                {
                    //console.log('both: ' + Game.getObjectById(link.id));
                    both.push(Game.getObjectById(link.id));
                }
                else if(link.linkType == 'receiver')
                {
                    //console.log('receivers: ' + Game.getObjectById(link.id));
                    receivers.push(Game.getObjectById(link.id));
                }
            }

            for(const sender of senders)
            {
                var target;
                //If the sender can't send, then don't bother with anything else
                if(sender.cooldown == 0 && sender.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                {
                    //Check if there are receivers 
                    for(const receiver of receivers)
                    {
                        if(receiver.store.getFreeCapacity(RESOURCE_ENERGY) > sendToReceiverThreshold)
                        {
                            target = receiver;
                        }
                    }
                    //If there are no receivers, check for 'both' type links to send to
                    if(target == undefined)
                    {
                        for(const bothLink of both)
                        {
                            if(bothLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                            {
                                target = bothLink;
                            }
                        }
                    }
                }
                //console.log(target);
                if(target)
                {
                    //console.log('sender link sending to: ' + target);
                    sender.transferEnergy(target);
                }
            }

            for(const bothLink of both)
            {
                var target;
                //If the sender can't send, then don't bother with anything else
                if(bothLink.cooldown == 0 && bothLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                {
                    for(const receiver of receivers)
                    {
                        //if(bothLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                        if(receiver.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                        {
                            target = receiver;
                        }
                    }
                }
                if(target)
                {
                    console.log('both link sending to: ' + target);
                    bothLink.transferEnergy(target);
                }
            }

        } catch (error) {
            console.log('RoomMgr.operateLinks code is failing. Error:' + error.stack)
        }
    }
};

module.exports = RoomMgr;