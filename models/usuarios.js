const pool = require("../conexion");
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

class UsuariosModel {
  Registrarse(usuarioPost) {
    return new Promise(async (resolve, reject) => {
      let usuario = usuarioPost.usuario;
      let nombre = usuarioPost.nombre;
      let email = usuarioPost.email;
      let rol = usuarioPost.rol;
      let clave = usuarioPost.clave;
      let claveEncriptada = await bcryptjs.hash(clave, 8);
  
      pool.query(
        `INSERT INTO usuarios (nombre, usuario, clave, email, rol) VALUES ('${nombre}', '${usuario}', '${claveEncriptada}', '${email}', '${rol}')`,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            // Consultar para obtener el usuario recién insertado
            pool.query(
              `SELECT * FROM usuarios WHERE usuario = '${usuario}'`,
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  // Simplemente resuelve la promesa sin crear una cuenta adicional
                  resolve();
                }
              }
            );
          }
        }
      );
    });
  }
  
    IniciarSesion(user) {
        return new Promise((resolve, reject) => {
            let usuario = user.user
            let clave = user.pass
      pool.query(
          `SELECT * FROM usuarios WHERE usuario = '${usuario}'`,
          async function (err, usuarioBD) {
              if (err) {
                  reject(err);
                } else {
                    if (usuarioBD.length > 0) {
              let contraseña = usuarioBD[0].clave;
              let contraseñaBaseusuario = await bcryptjs.compare(
                clave,
                contraseña
              )
              if (contraseñaBaseusuario) {
                let id = usuarioBD[0].id;
                let nombre = usuarioBD[0].nombre;
                let rol = usuarioBD[0].rol;
                let email = usuarioBD[0].email
                const token = jwt.sign(
                  {
                    id: id,
                    usuario: usuario,
                    nombre: nombre,
                    email: email,
                    rol: rol,
                  },
                  process.env.AUTENTICADOR
                );
                resolve(token);
              } else {
                reject(new Error("Contraseña Incorrecta"));
              }
            } else {
              reject(new Error("Usuario no Encontrado"));
            }
          }
        }
      );
    });
  }

  editarUsuario(id, usuario) {
    return new Promise((resolve, reject) => {
      const { nombre, email } = usuario;
      pool.query(
        "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
        [nombre, email, id],
        (error, usuarioBDs) => {
          if (error) {
            return reject(error);
          }
          resolve(usuarioBDs);
        }
      );
    });
  }

  borrarUsuario(id) {
    return new Promise((resolve, reject) => {
      pool.query(
        "DELETE FROM usuarios WHERE id = ?",
        [id],
        (error, usuarioBDs) => {
          if (error) {
            return reject(error);
          }
          resolve(usuarioBDs);
        }
      );
    });
  }
  Decodificar(token) {
    return new Promise((resolve, reject) => {
      if (token) {
        let usuario = jwt.decode(token, process.env.AUTENTICADOR);
        pool.query(`SELECT * FROM usuarios WHERE id=${usuario.id}`, function (err, result) {
          if (err) {
            reject(err);
          } else {
            if (result.length === 0) {
              reject(new Error("No existe el usuario"));
            } else {
              resolve(usuario);
            }
          }
        });
      }else{
        reject(new Error("No existe token"));
      }
    });
  }
  CerrarSesion(cookie) {
    return new Promise((resolve, reject) => {
      if (cookie) {
        resolve();
      } else {
        reject(new Error("No hay una sesion iniciada"));
      }
    });
  }
  Editar(usuarioid, datos) {
    return new Promise(async (resolve, reject) => {
      pool.query(`SELECT clave FROM usuarios WHERE id = '${usuarioid}'`, async function (err, result) {
        if (err) {
          reject(err);
        } else {
          let claveEncriptada = result[0].clave;
          let claveDesencriptada = await bcryptjs.compare(
            datos.contraseñaVieja,
            claveEncriptada
          );
          if (claveDesencriptada) {
            let claveCodificada = await bcryptjs.hash(datos.contraseñaNueva, 8);
            pool.query(`UPDATE usuarios SET nombre = '${datos.nombre}', usuario = '${datos.usuario}',clave = '${claveCodificada}',email = '${datos.email}' WHERE id = '${usuarioid}'`, function (err, result) {
              if (err) {
                reject(err);
              } else {
                resolve(result);
              }
            });
          } else {
            reject("Las contraseñas no coinciden");
          }
        }
      });
    });
  }
  Obtener(){
    return new Promise((resolve, reject) => {
      pool.query("SELECT * FROM usuarios",(err,result)=>{
        if(err){
          reject(err)
        }else{
          resolve(result)
        }
      })
      
    })
  }
  BorrarUsuario(id){
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM usuarios WHERE id = ${id}`,(err,result)=>{
            if(err){
                reject(err)
            }else{
                resolve()
            }
        })
    })
}
}

module.exports = new UsuariosModel();
