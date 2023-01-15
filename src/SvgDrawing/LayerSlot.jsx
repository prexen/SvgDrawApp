import {Component} from 'react';
import PrxSpinner from '../PrxComponents/PrxSpinner';
import PrxToggle from '../PrxComponents/PrxToggle';
import PrxSelect from '../PrxComponents/PrxSelect';

class LayerSlot extends Component{
   static defaultProps = {
      
   }
   constructor(props){
      super(props)
      this.state={
        
      }
   }
   
   componentDidMount=()=>{
      
   }
   
   updateParent=(obj)=>{
      this.props.updatePath(obj, this.props.path.uuid);
   }
   
   inputUpdate=(e)=>{
      let obj = {name: e.target.name, value:e.target.value};
      this.props.updatePath(obj, this.props.path.uuid);
   }

   deletePath=(e)=>{
      this.props.deletePath(this.props.path.uuid);
   }
   
   //prevenir selecionar o layer so pq clickou em algum controle interno do layer
   handleMouseDown=(event)=>{
      //event.stopPropagation();
      if(event.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         const downElement = event.target;
         const listenerObj = event.currentTarget;
         const mouseStartX = event.clientX;
         const mouseStartY = event.clientY;
         const startTime = Date.now();
         let hasMoved = false;
         const mouseMove = (event) => {
            let deltaMouseX = event.clientX - mouseStartX;
            let deltaMouseY = event.clientY - mouseStartY;
            let distSquared = (deltaMouseX * deltaMouseX) + (deltaMouseY * deltaMouseY);
            if(distSquared > 60){
               hasMoved = true;
            }
         }
         const endMove = (event) => {
            const deltaTime = Date.now() - startTime;
            if(deltaTime < 140 && hasMoved === false && (listenerObj === downElement) && (listenerObj === event.target)){
               this.props.selectPath(this.props.path.uuid);
            }
            listenerObj.removeEventListener('mousemove', mouseMove);
            listenerObj.removeEventListener('mouseup', endMove);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }
         listenerObj.addEventListener('mousemove', mouseMove);
         listenerObj.addEventListener('mouseup', endMove);
      }
   }
   
   render(){
      
      let path = this.props.path;
      let classNames = 'layerRow flexRow cursor'; //h-el400 //b-bot50
      if(this.props.isSelected === true){
         classNames += " el300";
      }
      
      const itemStyle = {
         gap:"6px",
         padding:"3px 5px 3px 5px",
         width: "100%",
         zIndex: `${this.props.zIndex}`,
      }
      const itemStyleDrag = {
         gap:"6px",
         padding:"3px 5px 3px 5px",
         width: "100%",
         transform: `translateY(${this.props.translateY}px)`, 
         zIndex: `${this.props.zIndex}`,
         transition: this.props.zIndex === 10 ? "none" : "transform 100ms",//se for o zIndex10 eh pq o selected do mouse eh ele, e ai nao usa o transition
      }
      
      return (
         
         
         <div className={classNames} style={this.props.dragging === true ? itemStyleDrag : itemStyle} onMouseDown={this.handleMouseDown} data-info="movable">
            
            <PrxToggle valor={path.visible} update={this.updateParent} name="visible" width="20px" height="20px" fontSize="9px"/>

            {/* ainda tem q fazer um componente que entenda "enter" pra finish o typing e "esc" */}
            <input value={path.pathName} name="pathName" onChange={this.inputUpdate} className="radius4 el200 b300 fwhite cursor" style={{margin:"0 5px", fontSize:"11px", width:"80px", height:"20px", padding:"2px 5px"}} id="pathName" type="text"/>

            <PrxSpinner valor={path.strokeWidth} update={this.updateParent} name="strokeWidth" decimals={1} minValue={0} maxValue={30} step={0.1} fontSize="11px" maxWidth="40px" maxHeight="20px"/>

            {/* <input value={path.strokeColor}
                    name="strokeColor"
                    onChange={this.inputUpdate}
                    className="radius4 el200 b300 fwhite cursor"
                    style={{fontSize:"11px", width:"40px", height:"20px"}}
                    id="strokeColor"
                    type="color" /> */}

            <button className="radius4 el200 b300 fwhite cursor"
                  data-name="strokeColor" onClick={this.openColorPicker}
                  style={{fontSize:"11px", width:"40px", height:"20px"}}>
                     <div className="b500" style={{padding:"4px 4px", backgroundColor:path.strokeColor}} />
            </button>

            <PrxSelect  valor={path.strokeLinejoin} update={this.updateParent} name={"strokeLinejoin"} options={this.props.svgOptions.strokeJoinTypes} width="60px" height="20px" fontSize="11px" menuWidth="80px"/>  

            <PrxSelect  valor={path.strokeLineCap} update={this.updateParent} name={"strokeLineCap"} options={this.props.svgOptions.strokeLinecapTypes} width="60px" height="20px" fontSize="11px" menuWidth="80px"/>  

            <PrxToggle valor={path.usePathFill} update={this.updateParent} name="usePathFill" width="20px" height="20px" fontSize="9px" />

            {/* <input value={path.pathFillColor}
                  name="pathFillColor"
                  onChange={this.inputUpdate}
                  className="radius4 el200 b300 fwhite cursor"
                  style={{fontSize:"11px", width:"40px", height:"20px"}}
                  id="fillColor"
                  type="color"/> */}

            <button className="radius4 el200 b300 fwhite cursor"
                  data-name="pathFillColor" onClick={this.openColorPicker}
                  style={{fontSize:"11px", width:"40px", height:"20px"}}>
                     <div className="b500" style={{padding:"4px 4px", backgroundColor:path.pathFillColor}} />
            </button>

            <PrxSelect  valor={path.vectorEffect} update={this.updateParent} name={"vectorEffect"} options={this.props.svgOptions.vectorEffectTypes} width="60px" height="20px" fontSize="11px" menuWidth="80px"/>

            <PrxSpinner valor={path.strokeDashA} update={this.updateParent} name="strokeDashA" decimals={2} minValue={0} maxValue={512} step={0.01} fontSize="11px" maxWidth="40px" maxHeight="20px"/>

            <PrxSpinner valor={path.strokeDashB} update={this.updateParent} name="strokeDashB" decimals={2} minValue={0} maxValue={512} step={0.01} fontSize="11px" maxWidth="40px" maxHeight="20px"/>
            
            
         
         

         </div>
      );
   }


   openColorPicker=(e)=>{
      let colorName = e.currentTarget.getAttribute("data-name");
      let pickerSetupObj = {
         nameForColor: colorName,
         pathUUID: this.props.path.uuid,
      }
      if(colorName === "strokeColor"){
         pickerSetupObj.startingColor = this.props.path.strokeColor;
      }
      else if(colorName === "pathFillColor"){
         pickerSetupObj.startingColor = this.props.path.pathFillColor;
      }
      this.props.openColorPicker(pickerSetupObj);
   }
}

export default LayerSlot;