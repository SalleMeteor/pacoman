upStream = new Meteor.Stream('up');
downStream = new Meteor.Stream('down');
chatCollection = new Meteor.Collection(null); //Bdd local (solo el cliente)

var rol = -1;

var lastTime = new Date().getTime();

// Recibimos un mensaje.
downStream.on('down', function(message) {
  
    // Recibimos un mensaje de movimiento: <numJugador0-5>-<posX>-<posY>
    console.log(message);
    
    var mov = message.split("-");
    
    if ( mov[0] == 6 ) { // Si la pieza es una cereza.
        $( "#div_cereza" ).css('left', mov[1] + 'px' );
        $( "#div_cereza" ).css('top', mov[2] + 'px' );
        
    } else { // Si la pieza es un pacman
        $( "#div_player_" + mov[0] ).css('left', mov[1] + 'px' );
        $( "#div_player_" + mov[0] ).css('top', mov[2] + 'px' );
    }
    
    if ( rol != mov[3] ) {
        rol = mov[3];
        cambiaRol ( mov[3] ); 
    }
    
});

function cambiaRol ( rol ) {
    //rol 0: 0, 2, 4(pares): Fantasmas, 1, 3, 5(impares): Pacmans. 
    //rol 1: 0, 2, 4(pares): Pacmans  , 1, 3, 5(impares): Fantasmas. 
    var imagen;
    
    for ( i = 0; i < 6; i++ ) {
        
        // ( rol0 - impares ) o ( rol1 - pares) -> Pacman
        if (   (rol == 0 && i % 2 )   ||   (rol == 1 && !(i % 2) )    ) {
            imagen = 'Pac' + i;
        } else {
            imagen = 'Gh' + i;
        }
         
        $( "#div_player_" + i ).css('background-image', 'url( "/images/' + imagen + '.png" )' ); 
        
    }
    
}


Template.tmplt_tablero.rendered = function () {
    
  upStream.emit('up', 'hello');
  
  // Aqui estamos precargando las imagenes en los div, sino hay problemas de caché.
  cambiaRol(rol); 
  
}


Template.tmplt_tablero.created = function () {
    
   precargarImagenes ();
    
    $('body').on('keydown', function ( e ) {
        //37: left, 38: up, 39: right, 40: down
        //console.log('Key pressed' + e.keyCode);
        
        if ( e.keyCode >= 37 && e.keyCode <= 40 ) {
            e.preventDefault(); // Evita scroll de la pagina al pulsar flechas.
        }
        
        if ((new Date().getTime() - lastTime) > 65) { //Si han pasado más de 10 mircosegundos
            lastTime = new Date().getTime();
        } else {
            return;
        }
        
        if ( e.keyCode == 37 ) {
            upStream.emit('up', 'left');
        } else if ( e.keyCode == 38 ) {
            upStream.emit('up', 'up');
        } else if ( e.keyCode == 39 ) {
            upStream.emit('up', 'right');
        } else if ( e.keyCode == 40 ) {
            upStream.emit('up', 'down');
        } else if ( e.keyCode == 13 ) { // 13:Tecla intro
            upStream.emit('up', 'connect');
        }
        
  });

}


function precargarImagenes () {
    var aux; 
   
    for ( var i = 0; i < 6; i++ ) {
        aux = new Image();
        aux.src = '/images/Pac' + i + '.png';  
        aux = new Image();
        aux.src = '/images/Gh' + i + '.png'; 
    }
 
}
