/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
import path from 'path'
import fs from 'fs'

sourceMapSupport.install({ handleUncaughtExceptions: false })

const source = path.resolve(__dirname, '../firebase-service-account.json');
const destination = path.resolve(__dirname, '../build/firebase-service-account.json');

fs.copyFile(source, destination, (err) => {
  if (err) {
    console.error("Erro ao copiar o arquivo de conta de serviço do Firebase:", err);
  }
  else {
    new Ignitor(__dirname)
      .httpServer()
      .start()
      .finally(() => {
        console.log("🔥 Servidor inicializado!");
        import("./start/ws.js")
      });
  }
});