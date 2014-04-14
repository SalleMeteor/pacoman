upStream = new Meteor.Stream('up');
downStream = new Meteor.Stream('down');

var tiempos = new Array();
var jugadores = ["0", "0", "0", "0", "0", "0"]
var posX = [0, 0, 0, 0, 0, 0, 0]; //La ultima pos es la de la fresa.
var posY = [0, 0, 0, 0, 0, 0, 0];

var velocidad = 6; //6
var rol = 0; //rol 0: 0, 2, 4: Fantasmas, 1, 3, 5: Pacmans. 



//Recibimos un mensaje. (Se podria cambiar por un method)
upStream.on('up', function ( message ) {
    var indice;
    //console.log("Msg received: " + message + " from (" +  this.userId + " - " + this.subscriptionId + ")");
    
    if ( message == 'hello' ) {
        sendHello(); //Le enviamos las coordenadas de todos los players.
        return;
    }  
  
    if ( !Meteor.playersFunct.isLoged ( this.userId ) ) {
      // Si el usuario no ha echo login no hacemos nada.
      return;
    }
  
    if ( message == 'connect' ) {   
      
      
      
        indice = conexion ( this.userId ); // Si no está conectado buscamos un hueco libre en el array jugadores.
        
        // Si se ha conectado lo metemos en la lista de jugadores.
        if ( indice != -1 ) {
            
            Meteor.playersFunct.setPlayerBD ( indice,  Meteor.playersFunct.getUserNameById ( this.userId )  );
            
        }
        
        return;
    }
    
    
  
    indice = numJugador ( this.userId );
    
    if ( indice == -1 ) {
        return;
    }
    
    // Actualizamos el tiempo del usuario.
    tiempos[indice] = new Date();
    
    moverFicha ( indice, message );
    comerFicha ( indice );
    comerFresa ( indice );    
    tunel ( indice );
});

function numJugador ( usuario ) {
  for ( var i = 0; i < 6; i++ ) {
    if ( jugadores[i] == usuario ) {
      return i;
    }
  }
  return -1;
}

function sendHello () {
    for ( var i = 0; i < 7; i++ ) {
        downStream.emit('down', i + "-" + posX[i] + "-" + posY[i] + "-" + rol );
    }
}

/*
Lógica juego
-----------------------------------------------------------------------------------
*/

function comerFresa ( ind ) {
    // en posX[6] posY[6] está la posición de la fresa.
    if ( dentroCuadrado( posX[ind], posY[ind], posX[6]-20, posY[6]-20, posX[6]+20, posY[6]+20 ) ) {
        console.log ("Comiendo fresa");
        if ( rol ) {
            rol = 0;
        } else {
            rol = 1;
        }
        downStream.emit('down', ind + "-" + posX[ind] + "-" + posY[ind] + "-" + rol );
        colocaPiezaRandom ( 6 ); //Recolocamos la fresa.
    }
   
   
}

function comerFicha ( ind ) {
    var aux;
    
    if ( ind % 2 ) { // Si es impar: 1, 3, 5: Pacmans.
        aux = 0;
    } else { // Si es par 0, 2, 4: Fantasmas.
        aux = 1;
    }

    // Miro solo mis enemigos (Si soy par, los impares, y al revés)
    for ( var i = aux; i < 6; i+=2 ) {
        
        if ( dentroCuadrado( posX[ind], posY[ind], posX[i]-20, posY[i]-20, posX[i]+20, posY[i]+20 ) ) {
            
            //rol 0: 0, 2, 4(pares): Fantasmas, 1, 3, 5(impares): Pacmans. 
            //rol 1: 0, 2, 4(pares): Pacmans  , 1, 3, 5(impares): Fantasmas.
            
            // ( rol0 y soyPar ) o ( rol1 y soyImpar) -> (Yo, fantasma, me como al pacman i)
            if ( (rol == 0 && !(ind%2) ) || (rol == 1 && (ind%2) ) ) {
                console.log("Nyammmm: " + ind + " -> " + i );
                nyammm ( ind, i );
            } else {
                console.log("Nyammmm: " + i + " -> " + ind );
                nyammm ( i, ind );
            }
            
        }
    }
    
}

function nyammm ( indComedor, indComido ) {
    
    Meteor.rankingsFunct.updateUserPoints ( Meteor.playersFunct.getUserNameById ( jugadores[indComedor] ), true );
    Meteor.rankingsFunct.updateUserPoints ( Meteor.playersFunct.getUserNameById ( jugadores[indComido] ), false );

    console.log ( "Usuario comido." );
    dexconexion ( indComido );
}

function moverFicha ( ind, message ) {
    
    if ( message == 'up' ) {    
        
        if ( posicionLibre ( posX[ind], posY[ind] - velocidad ) ) {
          posY[ind] -= velocidad;
        } else if ( posicionLibre ( posX[ind], posY[ind] -1 ) ) {
          posY[ind] -= 1;
        } else {
          return;
        }

    } else if ( message == 'down' ) {

        if ( posicionLibre ( posX[ind], posY[ind] + velocidad ) ) {
          posY[ind] += velocidad;
        } else if ( posicionLibre ( posX[ind], posY[ind] + 1 ) ) {
          posY[ind] += 1;
        } else {
          return;
        }

    } else if ( message == 'right' ) {

      if ( posicionLibre ( posX[ind] + velocidad, posY[ind] ) ) {
        posX[ind] += velocidad;
      } else if ( posicionLibre ( posX[ind] + 1, posY[ind] ) ) {
        posX[ind] += 1;
      } else {
        return;
      }

    } else if ( message == 'left' ) {

      if ( posicionLibre ( posX[ind] - velocidad, posY[ind] ) ) {
        posX[ind] -= velocidad;
      } else if ( posicionLibre ( posX[ind] - 1, posY[ind] ) ) {
        posX[ind] -= 1;
      } else {
        return;
      }
        
    }

    //Si velocidad = 20 no podria moverse, hacer que si no puede, intente moverse solo 1 posicion a delante.

    downStream.emit('down', ind + "-" + posX[ind] + "-" + posY[ind] + "-" + rol );
  }

  function showFicha ( ind, visible ) {
    if ( visible ) {
      posX[ind] = 200;
      posY[ind] = 200;
    } else {
      posX[ind] = 2000;
      posY[ind] = 2000;
    }
    

    downStream.emit('down', ind + "-" + posX[ind] + "-" + posY[ind] + "-" + rol );
  }

 



function posicionLibre ( xPos, yPos ) {
    // Horizontales
    if ( dentroCuadrado ( xPos, yPos, 15, 16, 100, 72 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 108, 16, 211, 72 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 275, 16, 376, 72 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 385, 16, 469, 72 ) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 15, 81, 100, 122 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 164, 81, 321, 122 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 385, 81, 469, 122 ) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 0, 129, 100, 219 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 108, 129, 211, 170 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 275, 129, 376, 170 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 385, 129, 500, 219 ) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 162, 177, 323, 267 ) ) { return false; } // Cuadro central
    
    if ( dentroCuadrado ( xPos, yPos, 0, 227, 100, 316) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 164, 275, 321, 316) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 385, 227, 500, 316) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 15, 323, 100, 364 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 108, 323, 211, 364 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 275, 323, 376, 364 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 385, 323, 469, 364 ) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 0, 371, 15, 412) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 164, 371, 321, 412) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 469, 371, 500, 412) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 15, 419, 211, 461) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 275, 419, 469, 461) ) { return false; }
    
    // Verticales
    if ( dentroCuadrado ( xPos, yPos, 52, 323, 100, 412) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 108, 81, 155, 219) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 108, 227, 155, 316) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 108, 371, 155, 461) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 218, 0, 266, 72 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 218, 81, 266, 170 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 218, 275, 266, 364 ) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 218, 371, 266, 461 ) ) { return false; }

    if ( dentroCuadrado ( xPos, yPos, 328, 81, 376, 219) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 328, 227, 376, 316) ) { return false; }
    if ( dentroCuadrado ( xPos, yPos, 328, 371, 376, 416) ) { return false; }
    
    if ( dentroCuadrado ( xPos, yPos, 385, 323, 432, 412) ) { return false; }
    
    // Es necessario que esta esté en la ultima posicion.
    if ( !dentroCuadrado ( xPos, yPos, 8, 8, 476, 468 ) ) { return false; }

    
    return true;
  }

  function dentroCuadrado ( xPos, yPos, xIni, yIni, xFin, yFin ) {
    if ( xPos > xIni && xPos < xFin && yPos > yIni && yPos < yFin ) {
      return true;
    }
    return false;
  }

function tunel ( indice ) {
    
    // Runel izquierda
    if ( dentroCuadrado ( posX[indice], posY[indice], 0, 214, 15, 232 ) ) {
        posX[indice] = 469;
        posY[indice] = 222;
        downStream.emit('down', indice + "-" + posX[indice] + "-" + posY[indice] + "-" + rol );
    
    // Tunel derecha
    } else if ( dentroCuadrado ( posX[indice], posY[indice], 470, 214, 500, 232 ) ) {
        posX[indice] = 15;
        posY[indice] = 222;
        downStream.emit('down', indice + "-" + posX[indice] + "-" + posY[indice] + "-" + rol );
    }
        
        
}

function colocaPiezaRandom ( indice ) {
    //Indice: 0-5: Players, 6: Fresa.
    var xPos;
    var yPos; 
    
    while (1) {
        xPos = getRandomNumber(8, 476);
        yPos = getRandomNumber(8, 468);
        
        if ( posicionLibre ( xPos, yPos ) && !encimaPieza ( xPos, yPos ) ) {
            break;
        }
    }
    
    posX[indice] = xPos;
    posY[indice] = yPos;
    downStream.emit('down', indice + "-" + posX[indice] + "-" + posY[indice] + "-" + rol );
    
}

function encimaPieza ( xPos, yPos ) {
    
    for ( var i = 0; i <= 6; i++ ) {
        
        if ( posX[i] > 1000 ) { continue; } //Si está fuera del tablero ni lo mires.
        
        if ( dentroCuadrado( xPos, yPos, posX[i]-20, posY[i]-20, posX[i]+20, posY[i]+20 ) ) {
            return true;    
        }
        
    }
    
    return false;
}

/*
Conexion
-----------------------------------------------------------------------------------
*/
function conexion ( usuario ) {
    
    // Si el usuario no está logeado no hacemos nada.
    if ( usuario == null ) {
        console.log("Usuario no logeado.");
        return -1;
    }
    
  // Si ya está conectado no hacemos nada.
    if ( numJugador ( usuario ) != -1 ) {
        return -1;
    }
  
    // Si no está conectado buscamos un hueco libre.
    for ( var i = 0; i < 6; i++ ) {

        if ( jugadores[i] == "0" ) {

            tiempos[i] = new Date();
            jugadores[i] = usuario;
            //showFicha ( i, true );
            colocaPiezaRandom ( i );
            console.log("Usuario conectado.");
            return i;
        }
    }

    return -1;
}

function getRandomNumber ( min, max ) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
Desconexion por inactividad
-----------------------------------------------------------------------------------
*/
Meteor.startup ( function() {
  
    for ( var i = 0; i < 6; i++ ) {
        posX[i] = getRandomNumber(195, 288);
        posY[i] = getRandomNumber(211, 235);
    }            
    colocaPiezaRandom ( 6 ); // Colocamos la fresa
    Meteor.setInterval( function() { desconexionAutomatica() }, 2000 );

});

function desconexionAutomatica () {


  for ( var i = 0; i < 6; i++ ) {

    if ( jugadores[i] != "0" ) {

      if ( ausente ( tiempos[i], new Date() ) ) {
        console.log("Usuario desconectado.");
        dexconexion ( i );
      }


    }

  }

}

function dexconexion ( idUser ) {
    Meteor.playersFunct.setPlayerBD ( idUser, "None" );

    posX[idUser] = getRandomNumber(195, 288); 
    posY[idUser] = getRandomNumber(211, 235);
    downStream.emit('down', idUser + "-" + posX[idUser] + "-" + posY[idUser] + "-" + rol );
    
    jugadores[idUser] = "0";
}

function ausente ( horaInicio, horaFin ) {

  var tiempoInicio = (horaInicio.getHours()*3600) + (horaInicio.getMinutes()*60) + horaInicio.getSeconds();
  var tiempoFin = (horaFin.getHours()*3600) + (horaFin.getMinutes()*60) + horaFin.getSeconds();

  // Si ha pasado más de 5 segundos (Comprueba cada 2 segundos, es mejor poner 4)
  if ( tiempoFin-tiempoInicio > 5 ) { //2
    return true;
  }

  return false;
  
}
  
