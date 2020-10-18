var grpBattleAlpha = {
//Runs a Battle Group of Creeps, from Inception to finality

//Includes a soaker, a healer, and a ranged assault

// This will create a new battlegroup
/*
Memory.BattleGroup.Alpha.spawned = false; // Check if full battlegroup is spawned
Memory.BattleGroup.Alpha.targetRoom = ''; // Room where soaking and final attacking of spawn will be done.
Memory.BattleGroup.Alpha.stagingRoom = ''; // Room where healers and attackers wait until target room is ready to be attacked
Memory.BattleGroup.Alpha.rallyRoom = ''; // Room to wait in until the battlegroup is all spawned. This should be the spawning room
Memory.BattleGroup.Alpha.spawners = ['']; //Spawner should be object ID
*/


//Gets passed a memory battle group object
    /** @param {memory}   **/
    run: function(BG_memObj) {
        if(!Memory.BattleGroup.spawned)
        {
            //Make memory objects to see if stuff has been made
            //Shouldn't have to check all three... shouldn't (lol right)
            if(Memory.BattleGroup.Alpha.soaker == undefined)
            {
                Memory.BattleGroup.Alpha.soaker = false;
                Memory.BattleGroup.Alpha.healer = false;
                Memory.BattleGroup.Alpha.rangedAttacker = false;
                Memory.BattleGroup.Alpha.CreepIDs = [];
                Memory.BattleGroup.Alpha.CreateTime = Game.time;
            }
            //Make sure room spawns are full of energy before being super draining
            if(!Memory.BattleGroup.Alpha.waitForRoomFull || Memory.BattleGroup.Alpha.waitForRoomFull == true)
            {
                Memory.BattleGroup.Alpha.waitForRoomFull = true;
                var tempSpawn = Game.getObjectByID(spawners);
                if(tempSpawn.room.energyAvailable == tempSpawn.room.energyCapacityAvailable)
                {
                    Memory.BattleGroup.Alpha.waitForRoomFull = false;
                }
            }

            if(((!Memory.BattleGroup.spawned) && (Memory.BattleGroup.Alpha.waitForRoomFull = false)))
            {
                var spawner = Game.getObjectByID(Memory.BattleGroup.Alpha.spawners);
                //Begin spawning process. Check if spawner is active, if not, then do spawning things
                if(!spawner.isActive() && Memory.BattleGroup.Alpha.soaker)
                {
                    //soaker configuration
                    //20 Tough (200 NRG) 10 Move (500 NRG, 1/3rd move ratio total), Total of 700 NRG
                    spawner.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], soakerBGAlpha, 
                    {memory: {role: 'soaker'}})

                }
                
                else if(!spawner.isActive() && Memory.BattleGroup.Alpha.rangedAttacker)
                {
                    //20 + 300 + 100 = 420 total for this attacker, 1/3rd move ratio
                    spawner.spawnCreep([TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE], rangedAttackerBGAlpha, 
                        {memory: {role: 'rangedAttacker'}})
                }
                else if(!spawner.isActive() && Memory.BattleGroup.Alpha.healer)
                {
                    // HEAL - 250 (500 Total), 1 to 1 move ratio, 600 total energy for the creep
                    spawner.spawnCreep([HEAL,HEAL,MOVE,MOVE], healerBGAlpha, 
                        {memory: {role: 'healer'}})
                }


                if(Memory.BattleGroup.Alpha.healer && Memory.BattleGroup.Alpha.rangedAttacker && Memory.BattleGroup.Alpha.soaker)
                {
                    Memory.BattleGroup.spawned = true;
                    Memory.BattleGroup.Alpha.SpawnTime = Game.time;
                    console.log('Time to create Battlegroup' + (BattleGroup.Alpha.SpawnTime - BattleGroup.Alpha.CreateTime))
                }
            }
        }
        //Otherwise do battle stuff
        else
        {

        }
        

        
		
	}
};

module.exports = roleBuilder;