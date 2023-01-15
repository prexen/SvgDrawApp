import {Component, createRef} from 'react';

//exemplo de uso
//<Spinner update={this.updateState} valor={this.state.clickCount} name="clickCount" decimals={1} minValue={0.1} maxValue={7} step={0.1} maxWidth="60px" label="w">


class PrxSpinner extends Component{
   static defaultProps = {
      //valores
      decimals: null,
      minValue: null,
      maxValue: null,
      step: 1,//default step eh 1 em 1

      //layout e styling
      fontSize: "12px",
      //iconAlign: "after",//optional, default after //usa isso? ainda nao sei como fazer...ou se vou fazer
      
      dragDistance: 77,

      //top | right | bottom | left
      margin:"0 0 0 0",
      position: "",
      left: "",
      top: "",
   }
   constructor(props){
      super(props)
      this.state={
         myValue: "--",//ainda nao sei como resolver...se bobear fazer um check que quando eh NaN -> bota "--"
      }
      this.inputField = createRef();//uso pro blur do input field (quando perde focus), e pro focus quando o drag eh click
      this.keyPressBlur = false;//pra saber se perdeu o input field perdeu focus com enter/esc ou click
      this.startingInputValue = 0;//pode ser null? nao sei
      this.useLocalState = false;
      
   }

   componentDidMount(){
      
   }
   
   render(){
      let childWidth = "0px";//se tiver label ou child, eu altero o tamanho do input pra dar espaco pra ele
      let inputTextAlign = "center";//se tiver label ou child, eu mudo pra left
      if(this.props.children != undefined){
         inputTextAlign = "left";
         if(this.props.children.props.style.width != undefined){//setei uma width pro children (o div do svg) ou qualquer outro elemento que eu sete o width
            childWidth = this.props.children.props.style.width;
            
         }
      }
      if(this.props.label != undefined){
         childWidth = "15px";
         inputTextAlign = "left";
      }

      //console.log(inputTextAlign);
      let inputStyle = {
         flexGrow: "auto",//sera que eh necessario ?
         maxWidth: `calc(100% - ${childWidth})`,
         textAlign: inputTextAlign,
         fontSize: this.props.fontSize,
         pointerEvents: "none",
      }
      
      const classNames = "radius5 el200 b300 h-b-acc100 flexRow vertcenter horcenter " + this.props.position;


      return (

         
         <div className={classNames}
            //padding : top | right | bottom | left
            style={{padding: "2px 2px 2px 0px", cursor:"col-resize", maxWidth:`${this.props.maxWidth}`, maxHeight:`${this.props.maxHeight}`, margin: `${this.props.margin}`,
                  left: this.props.left, top: this.props.top, }}
                  onMouseDown={this.handleMouseDown}>
            <input className='el200 fwhite myFont' style={inputStyle}// style={{flexGrow: "auto", maxWidth: `calc(100% - 10px)`, textAlign:"center", fontSize: "12px"}}
               ref={this.inputField}
               type="text" name="myValue"
               onFocus={this.handleInputFocus}
               onChange={this.handleInputChange}
               onKeyDown={this.checkEnterPress}
               onBlur={this.lostFocus}
               value={this.useLocalState === true ? this.state.myValue : this.props.valor}
               
            />
            {this.props.children === undefined ? (
               this.props.label === undefined ? <></> : 
               <span className='noselect el200 f300' style={{fontSize:"11px", flexShrink:"0"}}>{this.props.label}</span>
            )
               :
               this.props.children
            }
            
         </div>
         
      );
   }

   handleMouseDown=(event)=>{
      event.stopPropagation();
      this._isMouseDown = false;
      if(event.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         this._isMouseDown = true;
         //const startTime = Date.now();//not using atm
         let moved = false;

         let mouseStartX = event.clientX;
         let mouseStartY = event.clientY;
         let valueBefore = this.props.valor;

         const mouseMove = (event) => {
            moved = true;
            let deltaX = event.clientX - mouseStartX;
            //preciso normalizar o deltaX entre os maxs e depois multiplicar pelo q eui quero...
            const norm = deltaX / this.props.dragDistance;//normalizando o valor sobre
            const valueToAdd = norm * 1;//
            const stepValue = Math.round(valueToAdd / this.props.step) * this.props.step;
            let finalValue = window.utils.RoundNumber(valueBefore + stepValue, this.props.decimals);
            finalValue = ClampNumber(finalValue, this.props.minValue, this.props.maxValue);
            
            this.setState({myValue: finalValue});
            this.props.update(this.buildResultEvent(finalValue));
            
         }
         const endMove = (event) => {
            //const deltaTime = Date.now() - startTime;//not using atm
            if(moved === false){
               this.inputField.current.focus();
            }
            
            document.removeEventListener('mousemove', mouseMove);
            document.removeEventListener('mouseup', endMove);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }
   
         document.addEventListener('mousemove', mouseMove);
         document.addEventListener('mouseup', endMove);
      }
   }

   handleInputFocus=(evt)=>{
      this.startingInputValue = evt.target.value;
      this.keyPressBlur = false;
      this.useLocalState = true;//seta o input pra usar o value=this.state
      evt.currentTarget.select();//seleciona o texto que ta no input
      
   }

   handleInputChange=(e)=>{
      this.setState({[e.target.name]: e.target.value});//atualiza o state desse objeto...nao do parent
   }
   checkEnterPress=(e)=>{
      if (e.key === 'Enter') {
            this.keyPressBlur = true;
            let valueString = this.state.myValue.toString();
            let resultParse = this.solveValidInput(valueString, this.startingInputValue);
            let finalValue = this.ApplyStepAndClamp(resultParse);
            this.props.update(this.buildResultEvent(finalValue));
            this.setState({myValue: finalValue});
            
            this.inputField.current.blur();
            this.useLocalState = false;//seta o input pra usar o value=props
      }
      else if (e.key === 'Escape') {
            this.keyPressBlur = true;
            this.setState({myValue: this.startingInputValue});
            e.currentTarget.blur();
            this.useLocalState = false;//seta o input pra usar o value=props
      }
   }

   lostFocus=(e)=>{
      if(this.keyPressBlur === false){//se perdeu o focus com mouse
         let valueString = this.state.myValue.toString();
         const resultParse = this.solveValidInput(valueString, this.startingInputValue);
         let finalValue = this.ApplyStepAndClamp(resultParse);
         this.setState({myValue: finalValue});
         this.props.update(this.buildResultEvent(finalValue));
         //altera o state do parent
         this.useLocalState = false;//seta o input pra usar o value=props
      }
   }

   ApplyStepAndClamp(value){
      let stepValue = Math.floor(value / this.props.step) * this.props.step;
      let finalValue = window.utils.RoundNumber(stepValue, this.props.decimals);
      finalValue = ClampNumber(finalValue, this.props.minValue, this.props.maxValue);
      return finalValue;
   }
   
   solveValidInput=(inputValue, startingValue)=>{
      // if(isNaN(inputValue)){//isso aqui defende contra o q ?
      //    return startingValue;
      // }
      let valueString = this.state.myValue.toString();
      let regex = /([0-9]+\.?[0-9]*|\.[0-9]+)/;
      if(this.props.minValue < 0 || this.props.minValue === null){
            regex = /[-]?([0-9]+\.?[0-9]*|\.[0-9]+)/;
      }
      
      let arr = regex.exec(valueString);
      if(arr != null){
            const number = Number(arr[0]);//converte pra number
            const roundedNumber = window.utils.RoundNumber(number, this.props.decimals);//converte pros decimais
            const finalValue = window.utils.ClampNumber(roundedNumber, this.props.minValue, this.props.maxValue);//limita o input
            return finalValue;//decimals
      }
      else{ //se exec for null, falhar o regex, volta pro valor inicial
            return startingValue;
      }
   }
   buildResultEvent=(parValue)=>{  
      return {name:this.props.name, value: parValue}
   }
}

export default PrxSpinner;