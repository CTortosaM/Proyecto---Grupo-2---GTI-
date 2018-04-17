//   LIBRERIAS
var express = require('express');
var servidor = express();
var path = require('path');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var session = require('express-session');

//--------------------------------------------------------------
//  CONFIGURACION DEL SERVIDOR


servidor.use(express.static(__dirname));

//codigo servidor
servidor.use(bodyParser.json());
servidor.use(bodyParser.urlencoded({
  extended: true
}));
//---------------------------------------------------------------
servidor.use('/pagina_en_proceso/paginas', express.static(path.join(__dirname, 'public')))

servidor.post('/login', procesar_login);

servidor.get('/index', function(peticion, respuesta) {
  respuesta.sendFile(path.join(__dirname + "/paginas/index.html"));
});

servidor.get("/", function(peticion, respuesta) {

  respuesta.sendFile(path.join(__dirname + "/paginas/index.html"));
});

servidor.put('/cambioContrasenya', cambiarContrasenya);

servidor.put('/setUsuarioActivo', setUsuarioActivo);

//servidor.get('/lobby', procesarUsuario);
//BASE DATOS
var sqlite3 = require('sqlite3');
base_datos = new sqlite3.Database('base_datos.db', function(err) {
  if (err != null) {
    respuesta.sendStatus(503);
  }
});
//-----------------------------------------------------------------------------
//Procesar login
var objUsuario = {};

function procesar_login(peticion, respuesta) {
  function procesar_login2(err, row) {
    if (err != null) {
      respuesta.sendStatus(503);
    } else {
      if (row === undefined) {
        objUsuario = {
          status: 404
        }; //No encontrado el usuario
        respuesta.send(objUsuario);

      } else {
        if (row.contrasenya == peticion.query.password) {
          objUsuario = {
            usuario: row,
            status: 200
          };
          respuesta.send(objUsuario);
          //Logueo exitoso

          //respuesta.sendStatus(200);
        } else {
          objUsuario = {
            status: 401
          }; //Inautorizado
          respuesta.send(objUsuario);
        } //else
      } //else
    } //else
  } //procesar_login2
  base_datos.get('SELECT * FROM usuarios WHERE email=?', [peticion.query.email], procesar_login2);

} //procesarLogin

//--------------------------------------------------------------------------------
// FUNCIÓN QUE SE EJECUTA AL "SUBMIT" LA NUEVA CONTRASEÑA
function cambiarContrasenya(peticion, respuesta) {

  base_datos.all('UPDATE usuarios SET contrasenya=? WHERE id=' + peticion.query.id, [peticion.query.contrasenya], function(err, row) {
    if (err != null) {
      respuesta.sendStatus(503);
    } else {
      respuesta.sendStatus(200);
    }
  });

}
//---------------------------------------------------------------------------------
//FUNCIÓN PARA VOLVER ACTIVO UN USUARIO QUE YA SE HA LOGUEADO
function setUsuarioActivo(peticion, respuesta) {
  base_datos.all('UPDATE usuarios SET activo=1 WHERE id=' + peticion.query.id, function(err) {
    if (err != null) {
      respuesta.sendStatus(503);
    } else {
      respuesta.sendStatus(200);
    } //else
  });
}


servidor.listen(50971, function() {
  console.log('En marcha');
})
