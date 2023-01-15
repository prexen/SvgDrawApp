//create -> npm create vite@lastest
//vite to run -> npm run dev
import React, {Component} from 'react';

import SvgDrawingApp from './SvgDrawing/SvgDrawingApp.jsx';
import './App.css';
import './PrxStyle.css';

class App extends Component {
   static defaultProps = {
      
   }
   constructor(props){
      super(props)
      this.state={
         
      }
   }

   
   render() {
      return (
      <div className="App">
         <SvgDrawingApp />
      </div>
      );
   }
}

export default App;





