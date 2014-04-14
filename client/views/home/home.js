Template.tmplt_home.created = function () {
  
      // Ens subscrivim per llegir de la BDD, Collection Rankings
      Meteor.subscribe("allRankings");
    
}

Template.tmplt_home.helpers({
  
  // Aixo serveix per poder llistar els jugadors desde el template. (Hem d'estar subscrits)
    getListaRankings: function() {
      return Rankings.find({}, {sort: {points: -1}, limit:10});     
    },
  
  trunkName: function (name) {
    if ( name.length <= 7 ) {
      return name;
    } else {
      return name.substring(0,7);
    }
  }
});
                            

