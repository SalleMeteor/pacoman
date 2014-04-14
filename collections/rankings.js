Rankings = new Meteor.Collection ( "rankings" );

// Solo el server modifica la tabla de ranking de usuarios.
Rankings.deny({
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
Rankings.allow({
  insert: function () {
    return true;
  }
});
*/