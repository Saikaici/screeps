var MarketMgr = {
    // Market goals
    // 1. Keep energy from overflowing - list energy over 700k?
    // 2. Balance Terminals
    // 3. Sell/Buy energy if needed
    
    // Future - Mineral Management
    

    // Logical Steps
    //
    // Low/High global constant threshold for the rooms - Specifics?
    //
    // Get each room with a Terminal (We'll ignore rooms without one)
    // 
    // Calculate Energy available = Terminal Energy + Storage Energy
    // Transfer to other rooms if they need any
    // Calculate Energy for selling = Terminal Energy + Storage Energy - Existing Market orders for the room
    // Sell any excess
    // Buy any if needed - Calculate prices for range and buy cheapest


    /** @param {object} variables  **/
    update: function() {
        try {
            

        } catch (error) {
            console.log('MarketMgr.update code is failing. Error:' + error.stack)
        }
    }
};

module.exports = MarketMgr;