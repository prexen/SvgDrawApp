import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://www.youtube.com/watch?v=DpLtCbW_x2I&t=28s //antom falando o lance de https no localhost
import dns from 'dns'
import {readFileSync} from 'fs';
import {resolve} from 'path';

//https://www.npmjs.com/package/vite-plugin-singlefile
//npm install vite-plugin-singlefile --save-dev
import { viteSingleFile } from "vite-plugin-singlefile";//isso faz poder uma file so..e rodar direto local
//tem a alterar o package.json tb pra funcionar

dns.setDefaultResultOrder('verbatim')//ao inves de 127.0.0.1/ ... vira localhost

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react(), viteSingleFile()],
   build:{
     minify: false, 
   },
   server:{
      port: 5173,
      https: {
         key: readFileSync(resolve('localhost-key.pem')),
         cert: readFileSync(resolve('localhost.pem'))

      }
   }
})
