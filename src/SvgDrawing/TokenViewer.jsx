import {Component, createRef} from 'react';
import {TokenHelper} from './HelperDraw.jsx';
import PrxSpinner from '../PrxComponents/PrxSpinner';
import PrxToggle from '../PrxComponents/PrxToggle';
import PrxSelect from '../PrxComponents/PrxSelect';
import PrxSwitch from '../PrxComponents/PrxSwitch';

class TokenViewer extends Component{
   
   constructor(props){
      super(props)
      this.state={
         
         menuPosX: 0,
         menuPosY: 0,
         indexSelected: -1,

         menuOpen: false,//menu com opcoes - delete, edit, duplicate, displace
         editMenuOpen: false,//options - winding, n-sides, chanfer, size
         displaceMenuOpen: false,

         pathOpen: false,//o overlay mostrando o d="" do path

         startPosToken: [],
         maxDisplaceMagnitude: 20,
         displaceX: 0.5,
         displaceY: 0.5,
         tokenDisplaceX : 0,
         tokenDisplaceY : 0,
      }

      this.baseDiv = createRef();
   }
   
   updateState=(obj)=>{
      this.setState({[obj.name]: obj.value});
   }

   //abre o menu com delete, edit, duplicate, displace
   handleOpenBaseMenu=(e)=>{
      e.stopPropagation();
      if(e.button === 0){
         const rect = e.currentTarget.getBoundingClientRect();
         const indexSelected = e.currentTarget.getAttribute("data-index");
         const startTime = Date.now();
         const endMoveTokenSelect = (e) => {
            let deltaTime = Date.now() - startTime;
            if(deltaTime < 120){
               //pega o rect do <tr>
               let clickPosX = e.clientX;//rect.x + rect.width;//e.clientX;
               let clickPosY = rect.y + rect.height - 10;
               this.setState({menuOpen: true, menuPosX: clickPosX, menuPosY: clickPosY, indexSelected: indexSelected});
            }
            document.removeEventListener('mouseup', endMoveTokenSelect);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
         }
         document.addEventListener('mouseup', endMoveTokenSelect);
      }
   }

   mouseOverToken=(e)=>{//seta o indexHighlight
      let indexSelected = e.currentTarget.getAttribute("data-index");
      this.setState({indexSelected: indexSelected}, () => this.props.HighlightToken(indexSelected));
      //this.props.HighlightToken(indexSelected);
      
   }
   mouseOutToken=(e)=>{//reseta o indexHighlight caso o menu nao seja aberto
      if(this.state.menuOpen === false){
         this.setState({indexSelected: -1}, () => this.props.HighlightToken(-1));
      }
   }


   
   //abre o menu com options - winding, n-sides, chanfer, size
   selectTokenToEdit=(e)=>{
      this.setState({menuOpen: false, editMenuOpen: true, displaceMenuOpen: false});
      this.baseDiv.current.focus();//pro esc funcionar pra fechar os outros menus
   }
   //handle de quando muda uma option do token - pair com selectTokenToEdit
   changeTokenValue=(obj)=>{
      obj.tokenIndex = this.state.indexSelected;
      this.props.updateToken(obj);
   }
   
   duplicateSeletecToken=(e)=>{
      this.props.duplicateToken(this.state.indexSelected);
      this.setState({menuOpen: false, indexSelected: -1}, () => this.props.HighlightToken(-1));
   }
   

   //close todos os menus quando click fora do "fixed div"
   mouseDownCloseTokenMenu=(e)=>{
      if(e.button === 0){
         if(e.target === e.currentTarget){
            const startTime = Date.now();
            const closeEditMenu = (e) => {
               let deltaTime = Date.now() - startTime;
               if(deltaTime < 120){
                  //check pra ver se remove o state history...
                  if(this.state.displaceMenuOpen === true){
                     if(this.state.tokenDisplaceX === 0 && this.state.tokenDisplaceY === 0){
                        let removeSaveEvent = new Event("prxRemoveSaveEvent");
                        dispatchEvent(removeSaveEvent);
                     }
                  }

                  this.setState({editMenuOpen: false, pathOpen:false, displaceMenuOpen:false, indexSelected: -1}, () => this.props.HighlightToken(-1));
               }
               document.removeEventListener('mouseup', closeEditMenu);
               if (!this._isMouseDown) return;
               this._isMouseDown = false;
            }
            document.addEventListener('mouseup', closeEditMenu);
         }
      }
   }

   handleKeyDown=(e)=>{
      if(e.key === "Escape"){
         //check pra ver se remove o state do history
         if(this.state.displaceMenuOpen === true){
            if(this.state.tokenDisplaceX === 0 && this.state.tokenDisplaceY === 0){
               let removeSaveEvent = new Event("prxRemoveSaveEvent");
               dispatchEvent(removeSaveEvent);
            }
         }
         this.setState({menuOpen: false, editMenuOpen: false, pathOpen:false, displaceMenuOpen: false, indexSelected: -1}, () => this.props.HighlightToken(-1));
      }
      else if(e.key === "Delete"){
         let indexToRemove = this.state.indexSelected;
         this.setState({indexSelected : -1}, () => this.props.removeToken(indexToRemove));
      }
   }
                              
   focusArea=(e)=>{
      this.baseDiv.current.focus();
   }
   unfocusArea=(e)=>{
      this.baseDiv.current.blur();
   }

   
   

   //#region old controls
   

   closeMenu=(e)=>{
      e.stopPropagation();
      this.setState({menuOpen: false});
   }
   
   removeToken=(e)=>{
      let indexToRemove = this.state.indexSelected;
      this.setState({indexSelected : -1}, () => this.props.removeToken(indexToRemove));
   }
   
   openPathDisplay=(e)=>{
      this.setState({pathOpen: true});
   }
   
   //#endregion
   

   selectTokenToDisplace=(e)=>{
      let saveEvent = new Event("prxSaveHistoryEvent");
      dispatchEvent(saveEvent);
      let start = JSON.parse(JSON.stringify(this.props.tokens[this.state.indexSelected].pontos));//preciso de uma deepCopy
      this.setState({menuOpen: false, editMenuOpen: false, displaceMenuOpen: true, startPosToken: start, displaceX: 0.5, displaceY: 0.5, tokenDisplaceX: 0, tokenDisplaceY: 0});
      this.baseDiv.current.focus();//pro esc funcionar pra fechar os outros menus
   }
   
   moveDisplacementHandle=(e)=>{
      if(e.button === 0){
         const startTime = Date.now();

         let displaceMagnitude = 10;
         const stageSize = 59;
         const stageRect = e.currentTarget.getBoundingClientRect();
         let moved = false;
         const moveDisplacementHandle = (e) =>{
            const localPosX = e.clientX - stageRect.x;
            const localPosY = e.clientY - stageRect.y;
            const normX = window.utils.ClampNumber(localPosX / stageSize, 0, 1);
            const normY = window.utils.ClampNumber(localPosY / stageSize, 0, 1);
            const deltaX = normX - 0.5;
            const deltaY = normY - 0.5;
            const finalDisplaceX = window.utils.RoundNumber(deltaX * this.state.maxDisplaceMagnitude, 2);
            const finalDisplaceY = window.utils.RoundNumber(deltaY * this.state.maxDisplaceMagnitude, 2);
            moved = true;
            this.setState({displaceX: normX, displaceY: normY, tokenDisplaceX: finalDisplaceX, tokenDisplaceY: finalDisplaceY},
               () => this.props.displaceToken(this.state.indexSelected, this.state.startPosToken, finalDisplaceX, finalDisplaceY));
         }

         const endDisplacementHandle = (e) => {
            let deltaTime = Date.now() - startTime;
            if(moved === false){
               const localPosX = e.clientX - stageRect.x;
               const localPosY = e.clientY - stageRect.y;
               const normX = window.utils.ClampNumber(localPosX / stageSize, 0, 1);
               const normY = window.utils.ClampNumber(localPosY / stageSize, 0, 1);
               const deltaX = normX - 0.5;
               const deltaY = normY - 0.5;
               const finalDisplaceX = deltaX * this.state.maxDisplaceMagnitude;
               const finalDisplaceY = deltaY * this.state.maxDisplaceMagnitude;
               this.setState({displaceX: normX, displaceY: normY, tokenDisplaceX: finalDisplaceX, tokenDisplaceY: finalDisplaceY},
                  () => this.props.displaceToken(this.state.indexSelected, this.state.startPosToken, finalDisplaceX, finalDisplaceY));
            }
            if(deltaTime < 120){
                  
            }
            document.removeEventListener('mousemove', moveDisplacementHandle);
            document.removeEventListener('mouseup', endDisplacementHandle);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
         }
         document.addEventListener('mousemove', moveDisplacementHandle);
         document.addEventListener('mouseup', endDisplacementHandle);
      
      }
   }


   displaceTokenFromInput=(obj)=>{
      let newMagnitude = this.state.maxDisplaceMagnitude;
      // if(Math.abs(obj.value) > newMagnitude){
      //    newMagnitude = (window.utils.RoundNumber(Math.abs(obj.value), 0) + 1) * 2;
      // }
      if(obj.name === "tokenDisplaceX"){
         let repeatDisplaceY = this.state.tokenDisplaceY;
         let newDisplaceX = (obj.value / newMagnitude) + 0.5;
         this.setState({[obj.name]: obj.value, displaceX: newDisplaceX, tokenDisplaceY: repeatDisplaceY},//, maxDisplaceMagnitude: newMagnitude},
            () => this.props.displaceToken(this.state.indexSelected, this.state.startPosToken, obj.value, repeatDisplaceY));
      }
      else if(obj.name === "tokenDisplaceY"){
         let repeatDisplaceX = this.state.tokenDisplaceX;
         let newDisplaceY = (obj.value / newMagnitude) + 0.5;
         this.setState({[obj.name]: obj.value, displaceY: newDisplaceY, tokenDisplaceX: repeatDisplaceX},//, maxDisplaceMagnitude: newMagnitude},
            () => this.props.displaceToken(this.state.indexSelected, this.state.startPosToken, repeatDisplaceX, obj.value));
      }
   }
   

   


   render(){
      
      let displayCode = [];
      let fullPath = "";
      let fullPathAfterTrimming = "";
      if(this.props.tokens != null){
         for(let i = 0; i < this.props.tokens.length; i++){
            let svgPathValue = TokenHelper.convertTokenToPath(this.props.tokens[i]);
            let wind = "L";
            if(this.props.tokens[i].options.winding === "right"){
               wind = "R";
            }
            let tokenType = this.props.tokens[i].type;
            displayCode.push(<tr className='relative' style={{width:"100%"}} key={i} data-index={i} onMouseDown={this.handleOpenBaseMenu} onMouseOver={this.mouseOverToken} onMouseOut={this.mouseOutToken}>
                  <td className="noselect" style={{paddingLeft:"5px", width:"24px"}}>{i}</td>
                  <td className="noselect b300" style={{paddingLeft:"0px", width:"60px", textAlign:"center", verticalAlign:"middle"}}>{tokenType}</td>
                  <td className='h-fwhite b300' style={{padding:"0 5px 0 5px"}} >{svgPathValue}</td>
                  <td className="noselect b300" style={{paddingLeft:"0px", width:"20px", textAlign:"center", verticalAlign:"middle"}}>{wind}</td>
               </tr>);
            fullPath += svgPathValue;
         }
         
         fullPathAfterTrimming = TokenHelper.removeDuplicateCommands(fullPath);
         
      }
      
      let mainButtonClassName = "radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor";
      let mainButtonStyle = { height:"20px", fontSize:"12px", textAlign:"center"};

      return (

         <div className='onfocus-outline0' ref={this.baseDiv} onKeyDown={this.handleKeyDown} tabIndex="-1" onMouseEnter={this.focusArea} onMouseLeave={this.unfocusArea}>
            <p className='f100' style={{height: "17px", marginTop:"4px", whiteSpace:"pre"}}> Tokens</p>
            <div className='el200 f100' style={{height:"380px", paddingTop:"3px", overflow:"auto"}}>
               <table style={{fontSize:"12px"}}>
                  <tbody>
                     {displayCode}
                  </tbody>
               </table>
            </div>
            <div className="flexRow b-top300" style={{width:"100%", gap:"4px", padding:"4px 4px"}}>
               <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.openPathDisplay}>show path</button>
            </div>

            {/* base menu show */}
            {this.state.menuOpen &&
            <div className="fixedFull" onClick={this.closeMenu} style={{zIndex:"999"}}>
               <div className='absolute el300 b500' style={{width:"140px", height:"88px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY}px`}}  onClick={this.closeMenu}>
                  <button onClick={this.removeToken}>Delete Token</button>
                  <button onClick={this.selectTokenToEdit}>Edit Token</button>
                  <button onClick={this.duplicateSeletecToken}>Duplicate</button>
                  <button onClick={this.selectTokenToDisplace}>Move Token</button>
               </div>
            </div> }
            
            {/* edit token window */}
            {this.state.editMenuOpen &&
               <div className='fixedFull' style={{zIndex:"999"}} onMouseDown={this.mouseDownCloseTokenMenu}>
                  <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:"150px", height:"90px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY}px`}}>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>winding</label>   
                        <PrxSelect  valor={this.props.tokens[this.state.indexSelected].options.winding} update={this.changeTokenValue} name={"winding"}
                           options={this.props.shapeWindingList} width="50px" height="20px" fontSize="11px" menuWidth="80px"/>  
                     </div>
                     
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>n-side</label>   
                        <PrxSpinner valor={this.props.tokens[this.state.indexSelected].options.polygonSides} update={this.changeTokenValue} name="polygonSides"
                           decimals={2} minValue={3} maxValue={20} dragDistance={80} step={1} label="n"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>chanfer</label>   
                        <PrxSelect  valor={this.props.tokens[this.state.indexSelected].options.cornerType} update={this.changeTokenValue} name={"cornerType"}
                           options={this.props.rectCornerTypeList} width="50px" height="20px" fontSize="11px" menuWidth="80px"/>  
                     </div>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>size</label>   
                        <PrxSpinner valor={this.props.tokens[this.state.indexSelected].options.filletSize} update={this.changeTokenValue} name="filletSize"
                           decimals={2} minValue={0} maxValue={128} dragDistance={100} step={.01} label="u"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>


                  </div>
               
               </div>
            }


            {/* token displace window */}
            {this.state.displaceMenuOpen &&
               <div className='fixedFull' style={{zIndex:"999"}} onMouseDown={this.mouseDownCloseTokenMenu}>
                  <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:"150px", height:"90px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY}px`}}>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "60px",fontSize:"10px",margin:"0px 4px 0 5px"}}>Magnitude</label>   
                        <PrxSpinner valor={this.state.maxDisplaceMagnitude} update={this.updateState}
                           name="maxDisplaceMagnitude" decimals={0} minValue={1} maxValue={100} dragDistance={40} step={1} label="u"
                           fontSize="11px" maxWidth="60px" maxHeight="18px" margin="2px 8px 0 0"/>
                     </div>
                     
                     <div className='el100 absolute ' style={{width:"59px", height:"59px", left:"5px", top:"24px",
                              backgroundImage:"linear-gradient(#626268 1px, transparent 0), \
                                             linear-gradient(90deg, #626268 1px, transparent 0), \
                                             linear-gradient(#2f2f33 1px, transparent 0), \
                                             linear-gradient(90deg, #2f2f33 1px, transparent 0)",
                              backgroundSize: "29px 29px, 29px 29px, 15px 15px, 15px 15px",
                           
                           }} onMouseDown={this.moveDisplacementHandle}>
                        <div className='el100 absolute radiusfull' style={{width:"5px", height:"5px",
                            left:`calc(${(this.state.displaceX * 59)}px - 3px)`,//displaceX
                            top:`calc(${(this.state.displaceY * 59)}px - 3px)`,//displaceY
                            backgroundColor:"#a9b8ff", }}>

                        </div>
                     </div>

                     <PrxSpinner valor={this.state.tokenDisplaceX} update={this.displaceTokenFromInput} name="tokenDisplaceX" 
                           decimals={2} minValue={this.state.maxDisplaceMagnitude * -0.5} maxValue={this.state.maxDisplaceMagnitude * 0.5} step={0.01} dragDistance={40} label="x"
                           fontSize="11px" maxWidth="60px" maxHeight="18px" position="absolute" left="77px" top="34px"/>

                     <PrxSpinner valor={this.state.tokenDisplaceY} update={this.displaceTokenFromInput} name="tokenDisplaceY" 
                           decimals={2} minValue={this.state.maxDisplaceMagnitude * -0.5} maxValue={this.state.maxDisplaceMagnitude * 0.5} step={0.01} dragDistance={40} label="y"
                           fontSize="11px" maxWidth="60px" maxHeight="18px" position="absolute" left="77px" top="57px"/>
                     
                     

                  </div>
               
               </div>

            }

            
            
            {/* path string show */}
            {this.state.pathOpen &&
               <div className='fixedFull' style={{zIndex:"999", backgroundColor:"rgba(0,0,0,.5)", backdropFilter:"blur(5px)"}} onMouseDown={this.mouseDownCloseTokenMenu}>
                  
                  <div className="absolute el100 radius4" style={{padding:"20px 20px", width:"80vw", maxHeight:"600px", left:"5vw", top:"200px", overflow:"auto"}}>
                     
                     <span className='f100' style={{fontSize:"12px"}}>d="{fullPathAfterTrimming}"</span>
                  </div>
                  <button className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor absolute" style={{height:"20px", left:"calc(5vw - 10px)", top:"calc(200px - 10px)"}} onClick={this.closePath}>close (esc)</button>
               </div>
            }
            
            
            
         </div>
      );
            
   }

   closePath=(e)=>{
      this.setState({pathOpen: false});
   }

   //Html - path
   //stroke-width="3px" //o size do stroke default - > 1px
   //stroke //cor do stroke //default -> none (valores sao uma cor)
   //stroke-linecap //default -> butt
   //stroke-linejoin //default -> mitter
   //vector-effect //default -> none
   //stroke-dasharray //default -> none 
   //fill //default -> none , valores sao uma cor
   //d -> o path

   // <svg className='nomouse absolute b300' fill="none" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
   //preserveAspectRatio  (none| xMinYMin| xMidYMin| xMaxYMin| xMinYMid| xMidYMid| xMaxYMid| xMinYMax| xMidYMax| xMaxYMax) meet | slice -> default: xMidYMid meet
   //height
   //width
   //nao sei ainda a relacao do height and width com o viewbox
   //se eh melhor escalar o svg com width e height de 100% e botar um div em volta

   // <path drawing={pathItem.pathName}
   // stroke={pathItem.strokeColor}
   // strokeWidth={pathItem.strokeWidth}
   // strokeLinecap={pathItem.strokeLineCap}
   // strokeLinejoin={pathItem.strokeLinejoin} 
   // vectorEffect={pathItem.vectorEffect}
   // strokeDasharray={pathItem.strokeDasharray}
   // fill={pathItem.usePathFill ? pathItem.pathFillColor : "none"}//"none" ou cor
   // d={finalPath}
   //}

}

export default TokenViewer;