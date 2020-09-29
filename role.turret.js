var roleTurret = {

    /** @param {Creep} tower **/
    run: function(tower) {
        const turretRepairLimit = 125000;


        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        var towerRepair = 0;
    
        if ((tower.room.energyAvailable)/(tower.room.energyCapacityAvailable) > .95) {
            //console.log(Game.rooms['E47N27'].energyAvailable == Game.rooms['E47N27'].energyCapacityAvailable);
            towerRepair = 1;
        }
        else
        {
            towerRepair = 0;
        }


        if(closestHostile) {
            tower.attack(closestHostile);
        }
        else if(towerRepair) {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => (( structure.hits < structure.hitsMax) && (structure.hits < turretRepairLimit))
            });
            if(closestDamagedStructure && (((tower.store.getUsedCapacity(RESOURCE_ENERGY))/(tower.store.getCapacity(RESOURCE_ENERGY))) > .8 )){
                tower.repair(closestDamagedStructure);  
                }
            }    
        
    }
}

module.exports = roleTurret;