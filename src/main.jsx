import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './DefaultReset.css'
import {BuildUtilsFunctions} from './Utils/Utils_Window';


BuildUtilsFunctions();//RoundNumber , ClampNumber, DegToRad
startApp();
function startApp(){
   ReactDOM.createRoot(document.getElementById('root')).render(
      //   <React.StrictMode>
      //     <App />
      //   </React.StrictMode>
      <App />
   )
}
