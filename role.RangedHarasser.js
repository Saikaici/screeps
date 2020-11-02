var roleRangedHarasser = {
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


		//Needs to have a role in memory and an assigned room

		//If no enemy creeps in room, move to assigned room
		//If enemy creeps in room, engage with creep that has attack or rangedattack parts first - set that creep in memory as primary target
		// -Kite creep to be 2 range away (for optimal damage), use moveto command except flee
		//If enemy creeps in room, but none have attack parts then attack them
		// Otherwise, continue to target room
		// Chill in target room looking for targets


		var enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
		var enemyAttackCreeps = _.filter(enemyCreeps, 
			function(creep) {
				for(let part of creep.body)
				{
					if(part.type == ATTACK)
					{
						//console.log(part.type);
						return true;
					}
				}
				return false;
			});
		var spawnerTarget = creep.room.find(FIND_HOSTILE_SPAWNS);


		//var enemyAttackCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {filter: function(object) { return (object.body.includes(ATTACK) || object.body.includes(RANGED_ATTACK)); }});
		//var enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {filter: function(object) { return !(object.body.includes(ATTACK) || object.body.includes(RANGED_ATTACK)); }});
		//console.log('Creeps with Attack Parts ' + enemyAttackCreeps);
		//console.log('All Enemy Creeps ' + enemyCreeps);
		var rangeToTarget;
		//console.log('Enemy Creeps: ' + (enemyAttackCreeps && enemyCreeps));
		//If there are no enemy creeps, it moves to the middle of it's assigned room.
		//console.log(((enemyAttackCreeps.length ) && (enemyCreeps)));
		if((enemyAttackCreeps < 1) && (enemyCreeps.length < 1) && spawnerTarget.length < 1)
		{
			creep.moveTo(new RoomPosition(25,25,creep.memory.assignedRoom));
			//console.log('moving to room');
			if(creep.ticksToLive < 150)
			{
				creep.memory.assignedRoom = 'E49N29';
			}
			return;
		}
		//Attacks creeps with Attack parts first
		else if(enemyAttackCreeps.length > 0)
		{
			//let enemyAttackCreepsPos = enemyAttackCreeps.map(creep => creep.pos);
			
			//Memory.rooms[room].structures.towers.map(tower => Game.getObjectById(tower));
			//creep.memory.Target = (creep.pos.findClosestByPath(enemyAttackCreepsPos));
			var ActiveTarget = creep.pos.findClosestByPath(enemyAttackCreeps);
			rangeToTarget = creep.pos.getRangeTo(ActiveTarget);
			
			//console.log('attack creeps set target: '+ ActiveTarget)
		}
		//Otherwise targets the nearest enemy creep
		else if(enemyCreeps.length > 0)
		{
			
			var PassiveTarget = creep.pos.findClosestByPath(enemyCreeps);
			rangeToTarget = creep.pos.getRangeTo(PassiveTarget);
			//console.log('attack creeps set target: '+ PassiveTarget)
		}
		
		if(rangeToTarget)
		{
			console.log('Range to target: ' + rangeToTarget)
		}
		
		//Main combat routine
		if(ActiveTarget)
		{
			console.log('Active Hostile combat routine in use');
			//console.log('ActiveTarget.fatigue: ' + ActiveTarget.fatigue);
			creep.rangedAttack(ActiveTarget);
			if(rangeToTarget > 4)
			{
				creep.moveTo(ActiveTarget, {reusePath: 0});
			}
			else if(rangeToTarget > 3 && ActiveTarget.fatigue > 0)
			{
				creep.moveTo(ActiveTarget, {reusePath: 0});
			}
			else if(rangeToTarget < 3)
			{
				var fleePath;
				//Create a flee path
				fleePath = PathFinder.search(creep.pos, {pos: ActiveTarget.pos, range: 3}, {flee: true}).path;
				creep.moveByPath(fleePath);
				//console.log(fleePath);
			}
		}
		else if(PassiveTarget)
		{
			console.log('Passive combat routine in use')
			creep.rangedAttack(PassiveTarget);
			
			if(rangeToTarget > 0)
			{
				creep.moveTo(PassiveTarget, {reusePath: 0});
			}
		}
		else
		{
			console.log('Spawner Killer combat routine in use');
			rangeToTarget = creep.pos.getRangeTo(spawnerTarget[0]);
			//console.log(spawnerTarget);
			if(spawnerTarget)
			{
				creep.rangedAttack(spawnerTarget[0]);
			
				if(rangeToTarget > 0)
				{
					creep.moveTo(spawnerTarget[0]);
				}
			}
		}
	}
};

module.exports = roleRangedHarasser;