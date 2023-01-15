import {Component} from 'react';

//usage:
//<Toogle valor={this.state.someBoolValue} update={this.toogleBool} width="16px" height="16px" fontSize="7px">
   //posso passar children aqui pra ele renderizar com conditional pra se for false ou true
   //{this.state.someBoolValue === true ? <span></span> : <svg></svg>}
//</Toogle>
//<PrxToggle valor={this.state.showRulerSubD} update={this.updateToggle} width="19px" height="19px" fontSize="9px" name="showRulerSubD" />

//se nao tiver children, ele tem um default svg que usa baseado no valor do props.value

//TODO
//fazer uma prop pra indicar se o toggle ta inativo, -> render e logica
class PrxToggle  extends Component{
   static defaultProps = {
      fontSize: "9px",
   }
   constructor(props){
      super(props)
      
   }
   
   handleChange=(e)=>{
      let newValue = !this.props.valor;
      this.props.update({name: this.props.name, value: newValue});
   }

   render(){
      let elementInside = <></>;
      if(this.props.children != undefined){
         elementInside = this.props.children;
      }
      else{
         if(this.props.valor === true){
            elementInside = <span className='noselect f200' style={{fontSize:this.props.fontSize}}>on</span>   
         }
         else{
            elementInside = <span className='noselect f300' style={{fontSize:this.props.fontSize}}>off</span>
         }
      }
      
      return (
         <div className='radius5 el200 b300 h-b-acc100 flexRow vertcenter horcenter fwhite' style={{width:this.props.width, height:this.props.height, minWidth:this.props.width}} onClick={this.handleChange}>
            {elementInside}
         </div>
      );
   }
}

export default PrxToggle;