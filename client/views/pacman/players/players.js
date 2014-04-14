var rol = -1;

Template.tmplt_players.created = function () {
  
      // Ens subscrivim per llegir de la BDD, Collection Players
      Meteor.subscribe("allPlayers");
    
}

Template.tmplt_players.helpers({
  
  // Aixo serveix per poder llistar els jugadors desde el template. (Hem d'estar subscrits)
    getListaPlayers: function() {
        return Players.find();     
    },
    
    getColor: function ( numPlayer ) {
        
        switch ( numPlayer ) {
            case 0: return "#FF1F1A"; // Red
            case 1: return "#FFFB75"; // Yellow
            case 2: return "#73BCF9"; // Blue
            case 3: return "#008E2A"; // Green
            case 4: return "#FFACF9"; // Pink
            case 5: return "#FF8130"; // Orange
            default: return "white";
        }        
        
	}

});


