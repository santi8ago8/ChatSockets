/**
 * Created with JetBrains WebStorm.
 * User: SantiagoPC
 * Date: 18/03/13
 * Time: 16:35
 * To change this template use File | Settings | File Templates.
 */

var nombreUsuario;
var socket;
window.onload=function(){
    console.log($('input[name="submit"]'));
	socket = io.connect("http://localhost:3030/");
	//socket = io.connect("http://localhost:3030");
    $("[name='submit']").on({
        click:function(){
            nombreUsuario=$("[name='name']").val();
            console.log(nombreUsuario);
			console.log('Conectando!');
            $(".conection").html("Conectando... espere!");
			socket.on('connect',function(){
				console.log('se conecto!');
			});
			socket.on('connect_failed',function(){
				console.log('fallo la conexión');
			
			});
            socket.on('cliente-usuarios',function(data){
                for (i in data.usuarios){
                    mostrarUsuario(data.usuarios[i]);
                }
                $(".conection").html("");
                iniciarChat("GeneralchatGeneral","Chat general");
            });


            socket.on("cliente-mensaje",function(data){
                mostrarMensaje(data);
            });

            socket.on("cliente-userDisconect",function(data){
                console.log("cliente-userDisconect");
                console.log(data);
                desmostrarUsuario(data.nombre);
            });

            socket.on("cliente-userConnected",function(data){
                if (data.nombre!=nombreUsuario){
                    console.log("cliente-userConnected");
                    console.log(data);
                    mostrarUsuario(data.nombre);
                }
            });

            socket.emit("servidor-loggin",{nombre:nombreUsuario});



        }
    });

	$(window).unload(function(){
	    console.log("undoad");
		socket.emit('disconnect');
	});
}

function desmostrarUsuario(nombre){
    pnombre=$("p:contains('"+nombre+"')");
	
	console.log('desmotrar: '+nombre);
    pnombre=pnombre.get(0);
	if (pnombre!='undefined' && pnombre.parentNode!='undefined')
		pnombre.parentNode.removeChild(pnombre);
    //console.log("desconectado: "+nombre);
	if ( $("[value='"+nombre+"']").length>0 ){
		pdisc=$("<p class='disconnect'>Usuario desconectado...</p>");
		$("[value='"+nombre+"']").parent().children("[type='text']").val("");
		$("[value='"+nombre+"']").parent().children("[type='button']").get(0).setAttribute("disabled",'')
		$("[value='"+nombre+"']").parent().children("[type='text']").get(0).setAttribute("disabled",'')
		$("[value='"+nombre+"']").parent().children(".mensajes").append(pdisc);
	}
}

function mostrarUsuario(nombre){

    pnombre=$("<p class='userName'>"+nombre+"</p>")

    $(".personasConectadas").append(pnombre);
    if ($("[value='"+nombre+"']").length!=0){
        $("[value='"+nombre+"']").parent().children("[type='button']").get(0).removeAttribute("disabled");
        $("[value='"+nombre+"']").parent().children("[type='text']").get(0).removeAttribute("disabled")
    }
    pnombre.on({
        click:function (e){
            nombreNuevoChat=e.target.innerText;
            if ($("[value='"+nombreNuevoChat+"']").length==0){
                iniciarChat(nombreNuevoChat,nombreNuevoChat);
            }
        }
    })

}

function mostrarMensaje(data){
    desde=data.desde;
    if ($("[value='"+desde+"']").length==0){
        if (desde=="GeneralchatGeneral"){
            iniciarChat(desde,"Chat general");

        }
        else{
            iniciarChat(desde, desde);
        }
    }
    verMensaje(desde,data.nombre,data.mensaje);

}

function verMensaje(valorChat,persona,mensaje){

    mensajes=$("[value='"+valorChat+"']").parent().children(".mensajes");
    console.log(mensajes);
    p=$("<p></p>");
    n=$("<span>"+persona+": </span>");
    mens = $("<span>"+mensaje+"</span>");
    p.append(n,mens);
    mensajes.append(p);

    mensajes.animate({scrollTop:p.offset().top},150);

}

function iniciarChat(valueInput,header){
    chat=$("<div class='chat'></div>");
    nombreHeader=$("<p class='nombreHeader'>"+header+"</p>");
    cerrador=$("<p class='cerrador'>Cerrar</p>");
    cerrador.on({click:cerrarChat});
    mensajes=$("<div class='mensajes'></div>");
    inputHidden=$("<input type='hidden' class='chatUser' value='"+valueInput+"'/>");
    inputMens=$("<input type='text'>");
    inputEnviar=$("<input type='button'>");
    inputEnviar.val("Enviar");
    chat.append(nombreHeader);
    chat.append(cerrador);
    chat.append(mensajes);
    chat.append(inputHidden);
    chat.append(inputMens);
    chat.append(inputEnviar);
    chat.css("top","150px");
    chat.css("left","150px");
    $("body").append(chat);
    setDrag(chat,nombreHeader);
    setSend(inputEnviar,valueInput,inputMens);
}

function setSend(inputEnviar,nombreHeader,inputText){
    inputEnviar.on({
        click: function (){
            if (inputText.val().length>0){
                mens=inputText.val();

                datos={aUsuario:nombreHeader,mensaje:mens};
                console.log("datos:");
                console.log(datos);
                socket.emit("servidor-mensaje",datos);
                inputText.val("");
                if (nombreHeader!='GeneralchatGeneral')
                    verMensaje(nombreHeader,nombreUsuario,mens);
            }
        }
    });
}

function setDrag(elem,nombreHeader){
    mover(elem,nombreHeader);
    function mover(elem,nombreHeader){
        var moviendo=false;
        var elem=elem;
        var nombreHeader=nombreHeader;
        nombreHeader.on(
            {
                mousedown:function(e){
                    //console.log(e.target.parentNode);
                    //console.log(e.pageX+ e.pageY);
                    moviendo=true;
                    elem=e.target.parentNode;

                }
            }
        );
        $("body").on(
            {
                mousemove:function(e){
                    if (moviendo){
                        div=e.target.parentNode;

                        //console.log(elem);
                        //console.log((e.pageX-150)+"px");
                        //console.log((e.pageY-8)+"px");
                        elem.style.left= (e.pageX-150)+"px";
                        elem.style.top= (e.pageY-8)+"px";
                    }
                },
                mouseup:function(e){
                    moviendo=false;
                }
            }
        )
    };
}
function cerrarChat(elem){
    //console.log(elem);
    console.log(elem.target.parentNode.parentNode)
    elem.target.parentNode.parentNode.removeChild(elem.target.parentNode);
}