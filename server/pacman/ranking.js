// Para que se puedan subscribir.
Meteor.publish("allRankings", function( ) {

    return Rankings.find(); 

});

Meteor.rankingsFunct = {

  
    updateUserPoints: function ( playerName, winerOrLosser ) {
      var user;
      var pts;
      console.log("uno");
      if ( user = Rankings.findOne ({"name": playerName}) ) {
        console.log("mal");
        pts = user.points;
        
        if ( winerOrLosser ) {
          pts++;
        } else {
          pts--;
        }
        
        Rankings.update( {name: playerName}, {$set: {points: pts}} );
        
                        
      } else {
        console.log("bien");                
                        
        if ( winerOrLosser ) {
          console.log("bien2");
          Rankings.insert ( { name: playerName, points: 101 } );
        } else {
          console.log("perdedor");
          Rankings.insert ( { name: playerName, points: 99 } );
        }
      }
      
      
  
    }
    
}
