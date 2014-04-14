
// Para que se puedan subscribir.
Meteor.publish("allPlayers", function( ) {

    return Players.find(); 

});



Meteor.startup ( function() {
     resetBD();
});

function resetBD () {
    Players.remove ( {} );
    Players.insert ( { number: 0, name: "None" } );
    Players.insert ( { number: 1, name: "None" } );
    Players.insert ( { number: 2, name: "None" } );
    Players.insert ( { number: 3, name: "None" } );
    Players.insert ( { number: 4, name: "None" } );
    Players.insert ( { number: 5, name: "None" } );
}


Meteor.playersFunct = {
    
    setPlayerBD: function ( playerNum, playerName ) {
  
        Players.update( {number: playerNum}, {$set: {name: playerName}} ); 
  
    },
  
    getUserNameById: function ( idUser ) {
        //var user = Meteor.users.findOne ({"_id": idUser});
        return Meteor.users.findOne ({"_id": idUser}).username;
    },
  
    isLoged: function ( idUser ) {
        //var user = Meteor.users.findOne ({"_id": idUser});
      if ( Meteor.users.findOne ({"_id": idUser}) ) {
        return true;
      } else {
        return false;
      }
    }
    
}


