Meteor.startup(function () {   
  
  Session.set ( "titleColor", "yellow" );
    
});


Template.tmplt_title.helpers({
  
  getTitleColor: function ( numPlayer ) {
        
    return Session.get ( "titleColor" );
           
	}

});


Template.tmplt_title.events({
  
  'click #div_color': function (event) {
  
    Session.set("titleColor", $(event.target).css("background-color"));
  
  }
  
});