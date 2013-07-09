var io = require('socket.io').listen(3030,{log:false});

var usuarios={};
var usuariosNombres=Array();
io.sockets.on("connection",function(sock){

    sock.on('servidor-loggin',function(data){
        sock.emit("cliente-usuarios",{usuarios:usuariosNombres});
        io.sockets.emit("cliente-userConnected",{nombre:data.nombre});
        usuarios[data.nombre]=sock;
        usuariosNombres.push(data.nombre);
        sock.nombre=data.nombre;
        console.log("Conecto: "+data.nombre);
    });
    sock.on('servidor-mensaje',function(data){
       // {aUsuario:'string',mensaje:'string'}
        console.log("Servidor-mensaje");
        console.log(data);
        if (data.aUsuario=='GeneralchatGeneral'){
            io.sockets.emit("cliente-mensaje",{desde:"GeneralchatGeneral",mensaje:data.mensaje,nombre:sock.nombre});
        }
        else{
            usuarios[data.aUsuario].emit("cliente-mensaje",{desde:sock.nombre,mensaje:data.mensaje,nombre:sock.nombre});
        }
    });
    sock.on('disconnect',function(){
        delete usuarios[sock.nombre];
        usuariosNombres.splice(usuariosNombres.indexOf(sock.nombre),1);
        io.sockets.emit('cliente-userDisconect',{nombre:sock.nombre});
        console.log("Desconecto: "+sock.nombre);
    })
});