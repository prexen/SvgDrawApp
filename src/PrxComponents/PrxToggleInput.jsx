

//NAO USAR TA ZUADO //Nao usar, ta zuado 
import {Component} from 'react';

//usage:
//<Toogle value={this.state.someBoolValue} toogleFunction={this.toogleBool} width="16px" height="16px" fontSize="7px">
   //posso passar children aqui pra ele renderizar com conditional pra se for false ou true
   //{this.state.someBoolValue === true ? <span></span> : <svg></svg>}
//</Toogle>
//<PrxToggle value={this.state.showRulerSubD} toogleFunction={this.updateToggle} width="19px" height="19px" fontSize="9px" name="showRulerSubD" />

//se nao tiver children, ele tem um default svg que usa baseado no valor do props.value

//TODO
//fazer uma prop pra indicar se o toggle ta inativo, -> render e logica

//ta dando alguma merda com o lance de usar o input hidden e tal, nao to conseguindo fazer mais de um deles...super wierd...
//criei um outro que nao tem essa palhacada de input hiden, eh com div e faz a mesma coisa
class PrxToggleInput  extends Component{
   static defaultProps = {
      fontSize: "9px",
   }
   constructor(props){
      super(props)
      
   }
   
   handleChange=(e)=>{
      this.props.toogleFunction({name: this.props.name, value: e.target.checked});
   }

   render(){

      let elementInside = <></>;
      if(this.props.children != undefined){
         elementInside = this.props.children;
      }
      else{
         if(this.props.value === true){
            elementInside = <span className='noselect f200' style={{fontSize:this.props.fontSize}}>on</span>   
         }
         else{
            elementInside = <span className='noselect f300' style={{fontSize:this.props.fontSize}}>off</span>
         }
      }
         
      
      return (
         <>
            {/* eu preciso da label pra poder trigger o input */}
            <label className='radius5 el200 b300 h-b-acc100 flexRow vertcenter horcenter fwhite'
               style={{width:this.props.width, height:this.props.height, maxWidth:this.props.maxWidth, maxHeight: this.props.maxHeight}} htmlFor={this.props.name} >
                  {elementInside}
            </label>
            <input id={this.props.name} className='displaynone' type="checkbox" onChange={this.handleChange} value={this.props.value} defaultChecked={this.props.value}/>
         </>
      );
   }
}

export default PrxToggleInput;