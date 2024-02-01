const fs = require('node:fs')

console.log('Leyendo el primer archivo...')
fs.readFile('./archivo.txt', 'utf-8', (err, text) => {
  try {
    // <---- ejecutas este callback
    console.log('primer texto:', text)
  } catch (error) {
    console.error('Error al leer el directorio: ', err)
  }
})

console.log('--> Hacer cosas mientras lee el archivo...')

console.log('Leyendo el segundo archivo...')
fs.readFile('./archivo2.txt', 'utf-8', (err, text) => {
  try {
    console.log('segundo texto:', text)
  } catch (error) {
    console.error('Error al leer el directorio: ', err)
  }
})
