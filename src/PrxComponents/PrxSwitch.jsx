import {Component} from 'react';

//usage
//<PrxSwitch update={this.toogleTeste} value={this.state.bool3} name={"bool3"} height="14px"/>

class PrxSwitch  extends Component{
   static defaultProps = {
      height: "12px",
      trailOnColor: "#387eda",
      trailOffColor: "#9a9a9f",
      knobOnColor: "white",
      knobOffColor: "white",
      margin: "0 0 0 0",
   }
   constructor(props){
      super(props)
   }
   
   handleChange=(e)=>{
      let newValue = !this.props.value;
      this.props.update({name: this.props.name, value: newValue});
   }
   
   render(){

      
      let trailHeight = this.props.height;
      let trailRadius = `calc(${trailHeight} * 0.5)`;
      let widthPar = `calc(${trailHeight} * 2 + 2px)`;//30px
      let knobWidth = `calc(${trailHeight} - 2px)`;//"12px";
      let knobHeight = `calc(${trailHeight} - 2px)`;//"12px";
      let knobRadius = "50%";//50%
      
      let margin = this.props.margin;
      //top: `calc(-1 * ((${knobHeight} * 0.5) - (${trailHeight} * 0.5)))`, //quando eh no meio do trail
      //left: this.props.value === false ? `calc(100% - (${knobWidth} * 0.7))` : `calc(-1 * (${knobWidth} * 0.3))`,//pra trail

      let knobStyle={
         width:knobWidth, height:knobHeight, borderRadius:knobRadius,
         backgroundColor: this.props.value === false ? this.props.knobOffColor : this.props.knobOnColor, 
         top: "1px",//`calc(-1 * ((${knobHeight} * 0.5) - (${trailHeight} * 0.5)))`,
         left: this.props.value === false ? `1px` : `calc(100% - (${knobWidth} * 1) - 1px)`,//`calc(-1 * (${knobWidth} * 1))`,
         transition: "left 0.1s",
      }
      let trailStyle={
         width:widthPar, height:trailHeight, marginTop:"0px", borderRadius:trailRadius,
         backgroundColor: this.props.value === false ? this.props.trailOffColor : this.props.trailOnColor,
      }
      
      return (
         <div className='flexCol vertcenter' style={{width:widthPar, height: trailHeight, margin: margin}} onClick={this.handleChange}>
            <div className='relative' style={trailStyle}>
               <div className='el200 absolute' style={knobStyle} >
               </div>
            </div>
         </div>
      );
   }
}

export default PrxSwitch;