import {Component} from 'react';

class Template extends Component{
   static defaultProps = {
      prop1: "*************",
      prop2: ["slot 0", "slot 1", "slot 2"]
   }
   constructor(props){
      super(props)
      this.state={
         clickCount: 0,
         stateEnum: "fase0"
      }
   }
   
   render(){
      const props = this.props;
      const cssStyle1 = {
         fontSize: "12px"
      }
      return (

         <div>
            <h1>Template</h1>
            <p style={cssStyle1}>This is a template component</p>
         </div>
      );
   }
}

export default Template;
