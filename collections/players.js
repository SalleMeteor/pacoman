Players = new Meteor.Collection ( "players" );

// Solo el server modifica la tabla de usuarios conectados.
Players.deny({
  insert: function() {
    return true;
  },
  update: function() {
    return true;
  },	
  remove: function() {
    return true;
  }
});

/*
Players.allow({
  insert: function () {
    return true;
  }
});
*/