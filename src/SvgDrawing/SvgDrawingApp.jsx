import {Component, createRef} from 'react';

import './SvgApp.css';
import TokenViewer from './TokenViewer';
import LayerSlot from './LayerSlot.jsx';
import {ToolHelper, TokenHelper, BuildSvgString} from './HelperDraw.jsx';
import PrxSpinner from '../PrxComponents/PrxSpinner';
import PrxToggle from '../PrxComponents/PrxToggle';
import PrxSelect from '../PrxComponents/PrxSelect';
import PrxSwitch from '../PrxComponents/PrxSwitch';
import PrxColorPicker from '../PrxComponents/PrxColorPicker';
import MessageBox from './MessageBox';

import {Vector2D, dotProduct} from '../Utils/Lib2D.jsx';
import IconLibrary from './IconLibrary';

class SvgDrawingApp extends Component{
   static defaultProps = {
      svgPathOptions: {
         strokeJoinTypes: ["miter", "round", "bevel", "arcs" ,"miter-clip"],
         strokeLinecapTypes: ["round" , "square", "butt"],
         vectorEffectTypes: ["none", "non-scaling-stroke"],
      },
      shapeWindingList: ["left","right"],
      rectCornerTypeList: ["none", "chanfer", "fillet"],
      
      drawAreaSize: 512,//tamanho da view area pra draw mult de 64...min size 512
   }
   constructor(props){
      super(props)
      this.state={
         viewBoxWidth: 32,//testar isso aqui -> pra poder ter icones sem ser quadrado ? //todo
         viewBoxHeight: 32,//testar isso aqui -> pra poder ter icones sem ser quadrado ? //todo
         
         rulerDivision: 8,//quantos segmentos de ruler...se size32 e div8 -> serao 8 segmentos de 4 unidades
         rulerSubdivision: 4,//quantos subdivisoes os segmentos terao, 2, 4...8...pra ficar bonito depende da relacao size|division|subdivision - numero bom é multiplos de size/division
         
         showGrid: true, //options de show grid
         showRulerDivision: true,
         showRulerSubD: true,

         showIconImage: true,

         scale: 1,
         mouseInfo: {
            mouseX: 0,
            mouseY: 0,
            ax: 0,
            ay: 0,

         },

         snap: false,
         snapToEndPoints: false,
         snapToMidPoints: false,
         snapToIntersection: false,
         snapToGrid: false,
         snapGridStep: 1,
         snapToAngle: false,
         snapAngleStep: 10,

         //display e drawing area
         offsetDisplayX: 0,//quando pan a drawArea, comeca em 0 //no new drawing reseta isso
         offsetDisplayY: 0,//quando pan a drawArea, comeca em 0 //no new drawing reseta isso
         
         savedView:{
            x:0,y:0,z:1
         },
         
         svgMousePosX: 0,//mouse posX no svg canvas
         svgMousePosY: 0,//mouse posY no svg canvas

         //rectTool , polygonTool , arc , circle ---
         shapeWinding: "left",//right //left
         polygonSides: 3,
         rectCornerType: "none",//none //chanfer //fillet
         rectFilletSize: 4,
         
         

         lastToolSelected: "noneTool",//quando o cara der Enter duas x, ele repete o comando anterior :)
         currentTool: "noneTool",
         

         commandExecution: ToolHelper.initTool("noneTool").command,
         tempToken: null, //isso aqui eh convertido em tempPath e quando finaliza o comando em tokenList
         
         svgName: "",
         stageBackgroundColor: "#00000000",
         currentPathSelected: 0,
         svgPaths:[
            
         ],
         translateArrayY:[],//drag dos layerSlots
         isPerformingDrag: false,

         highLightTokenIndex: -1,
         movePointIdentifier: {tokenIndex: -1, pointIndex: -1},

         history: [], //salva o svgPaths
         
         //path displacement-------
         tempTokenListForDisplacement: [],//preciso pra pegar as posicoes antes de dar displacement no path
         pathDisplaceX: 0,
         pathDisplaceY: 0,
         pathDisplaceHandlePosX: 0.5,
         pathDisplaceHandlePosY: 0.5,
         //-------------------------
         boolWindows:{
            displaceMenuOpen: false,
            svgCodeWindowOpen: false,//react e html string to svg //ref: fixedDiv1
            saveConfirmationPopup: false,
         },
         
         iconLibraryOpen: false,
         svgIconStrings: {}, //objeto que tem as strings de como fazer o elemento svg em html e react

         loadedImage: null,

         openColorPicker: false,
         pickerSetup:{
            nameForColor: "",
            pathUUID: "",
            startingColor: "",
         }

      }
      
      //
      this.fixedWindowsRef = {
         displaceWindow: createRef(),//displaceMenuOpen
         svgCodeWindow: createRef(),//svgCodeWindowOpen
         saveWindow: createRef(),//saveConfirmationPopup
      }

      this.toolsDicRef = {
         noneTool: createRef(),//display name, ref, valueInterno
         moveTool: createRef(),
         lineTool: createRef(),
         circleTool: createRef(),
         circleEdgeTool: createRef(),
         arcTool: createRef(),
         bezierTool: createRef(),
         rectTool: createRef(),
         polygonTool: createRef(),
      }

      this.canvasRef = createRef();
      this.fileInput = createRef();
      this.dragListRef = createRef();
      

      this.lines = [];//pra calcular os collisionPoints
      this.circles = [];//pra calcular os collisionPoints
      this.anchorPoints = [];
      this.collisionPoints = [];//line x line | circle x circle | line x circle
      
   }
   
   componentDidMount=()=>{
      // let firstView = this.state.savedView;
      // firstView.z = this.state.scale;
      // this.setState({savedView: firstView});
      addEventListener('prxSaveHistoryEvent', this.saveHistory);
      addEventListener('prxRemoveSaveEvent', this.removeHistoryPoint);

      this.createNewDraw();
   }
   componentWillUnmount=()=>{
      removeEventListener('prxSaveHistoryEvent', this.saveHistory);
      removeEventListener('prxRemoveSaveEvent', this.removeHistoryPoint);
   }




   

   saveSvgToLib=(e)=>{
      
      //checks pra ver se posso salvar o elemento:
      if(this.state.svgName === ""){
         this.sendMessageEvent(e, "svg has no name...cant save it.");
         //console.log("svg has no name...cant save it.");
         return;//algum feedback falando que nao tem nome no svg

      }

      if(this.state.viewBoxWidth < 3 || this.state.viewBoxHeight < 3){
         this.sendMessageEvent(e, "view box is too small...need at least 3 units.");
         //console.log("svg view box is too small...need at least 3 units");
         return;//algum feedback - viewbox tem q ser >= do que 3
      }

      if(this.state.svgPaths.length === 0){
         this.sendMessageEvent(e, "theres no path to save.");
         return;//algum feedback - nao tem path nenhum
      }


      let emptySvg = true;
      for(let i =0; i < this.state.svgPaths.length; i++){
         if(this.state.svgPaths[i].tokenList.length > 0){
            emptySvg = false;
            break;
         }
      }
      if(emptySvg){
         this.sendMessageEvent(e, "Add elements to layers. Drawing is empty.");
         //console.log("svg has nothing to draw...cant save it - add elements to layers");
         return;//algum feedback - algum elemento dentro dos layers
      }

      //check pra ver se tem espaco no localStorage?

      //save de fato
      const iconObject = {
         iconName : this.state.svgName,
         viewBoxWidth : this.state.viewBoxWidth,
         viewBoxHeight : this.state.viewBoxHeight,
         svgPaths : this.state.svgPaths,
      }
      
      let all_Icons = JSON.parse(window.localStorage.getItem("prxIcons"));
      if(all_Icons === null){//FIRST SAVE do localStorage
         let firstAllIcons = [];
         firstAllIcons.push(iconObject);
         const allIconsJSON = JSON.stringify(firstAllIcons);
         window.localStorage.setItem("prxIcons", allIconsJSON);
         //preciso de algum feedback visual mostrando que o icone foi salvo
         //console.log("first save no local storage");
         this.sendMessageEvent(e, "icon saved.");
      }
      else{//ja existe alguma coisa com o nome "prxIcons"
         //ver se ja existe algum icone com o nome iconObject.iconName
         const i = all_Icons.findIndex(element => element.iconName === iconObject.iconName);
         if (i > -1) {
            //elemento existe no localstorage, abre um popup pergutando se subtitui o elemento ...
            let atributo = e.currentTarget.getAttribute("data-allowsave");
            if(atributo === null){
              
               let windows = this.state.boolWindows;
               windows.saveConfirmationPopup = true;
               this.setState({boolWindows: windows}, ()=> this.fixedWindowsRef.saveWindow.current.focus());
               return;
            }
            else{
               //salva o elemento de fato e fecha o popup
               all_Icons[i] = iconObject;
               const allIconsJSON = JSON.stringify(all_Icons);
               window.localStorage.setItem("prxIcons", allIconsJSON);
               //console.log("updated element on local storage");
               this.sendMessageEvent(e, "icon updated.");
               let windowsClosed = this.state.boolWindows;
               for (const key in windowsClosed) {
                  windowsClosed[key] = false;
               }
               this.setState({boolWindows: windowsClosed});
               return;
            }
            
         }
         else{
            //elemento nao existe no localstorage, adiciona o elemento
            all_Icons.push(iconObject);
            console.log("adding element to local storage");
         }
         const allIconsJSON = JSON.stringify(all_Icons);
         window.localStorage.setItem("prxIcons", allIconsJSON);
         this.sendMessageEvent(e, "icon saved.");
         //console.log("saved.");
         //preciso de algum feedback visual mostrando que o icone foi salvo
      }
      
   }
   sendMessageEvent=(e, message)=>{
      let startEvent = new Event("prxMessageEvent");
      startEvent.prxData = {xPos: e.clientX, yPos: e.clientY, text:message};
      dispatchEvent(startEvent);
   }


   loadSvgFromLib=(svgObj)=>{
      
      let toolSelected = "noneTool";
      let result = ToolHelper.initTool(toolSelected);
      this.setState({svgName: svgObj.iconName,
                     svgPaths: svgObj.svgPaths,
                     viewBoxWidth: svgObj.viewBoxWidth,
                     viewBoxHeight: svgObj.viewBoxHeight,
                     currentPathSelected: 0,

                     //parte do tool
                     currentTool: result.toolSelected,
                     commandExecution: result.command,
                     tempToken: result.token,

                     //close a lib
                     iconLibraryOpen: false,

                     //reset a history
                     history: [],
                  },
         () => this.zoomToFill(), this.toolsDicRef[toolSelected].current.checked = true);//multiplos callbacks after 
   }
   

   //svg name input
   inputUpdate=(e)=>{
      this.setState({[e.target.name]: e.target.value});
   }
   inputHandleKeyDown=(e)=>{
      if(e.key === "Enter"){
         e.currentTarget.blur()
      }
   }



   //no create de um new draw...
   //#region Create draw, add path remove path...
   createNewDraw=(e)=>{
      let newPathArray = [];
      newPathArray.push(this.createNewPath("0"));
      newPathArray[0].pathName = "support";
      newPathArray[0].strokeColor = "#e67d15";
      newPathArray[0].vectorEffect = "non-scaling-stroke";
      
      newPathArray.push(this.createNewPath("1"));
      newPathArray[1].strokeWidth = 1;//1 default
      // //testes apenas, pra iniciar com algumas formas
      // let token1 = {
      //    type: "line",
      //    //pontos:[{x:0, y:0}, {x:8, y:8}, {x:20, y:8}],
      //    pontos:[{x:8, y:8}, {x:20, y:8}],
      //    options: this.getShapeOptions(),
      // }
      // let token2 = {
      //    type: "line",
      //    pontos:[{x:16, y:2}, {x:16, y:14}],
      //    options: this.getShapeOptions(),
      // }
      // newPathArray[1].tokenList.push(token1);
      // newPathArray[1].tokenList.push(token2);
      
      const selected = newPathArray.length - 1;
      this.setState({svgPaths: newPathArray,
         currentPathSelected: selected,
         offsetDisplayX: 0,
         svgName: "new icon",
         history: []}, () => this.zoomToFill());
      
   }

   AddNewPath=(e)=>{
      if(this.state.svgPaths.length === 6){
         return;
      }
      let pathArray = this.state.svgPaths;
      this.saveHistory();
      let newPath = this.createNewPath(this.state.svgPaths.length);
      pathArray.push(newPath);
      const selected = pathArray.length - 1;

      let arr = [];
      pathArray.map((item)=> arr.push(0));

      this.setState({svgPaths: pathArray, currentPathSelected: selected, translateArrayY: arr});
   }
   createNewPath=(nameSuffix)=>{
      let pathName = "path " + nameSuffix;
      let newPath = {
         pathName: pathName,
         visible: true, //se quiser hide o path no drawing, 
         strokeWidth: 1,
         strokeColor: "#ffffff",
         usePathFill: false,
         pathFillColor: "#ffffff",
         strokeLinejoin: "round",
         strokeLineCap: "round",
         vectorEffect: "none",
         strokeDashA: 0,
         strokeDashB: 0,
         strokeDasharray: "none",//derivada dos outros 2
         tokenList: [],
         uuid: crypto.randomUUID(),
      };
      return newPath;
   }

   updatePathProperties=(obj, pathId)=>{
      let pathArray = this.state.svgPaths;
      let pathItem = pathArray.find(item => item.uuid === pathId);
      let index = pathArray.indexOf(pathItem);
      
      //edge case
      if(obj.name === "strokeDashA" || obj.name === "strokeDashB"){
         let dashArray = "";
         if(obj.name === "strokeDashA"){
            pathItem.strokeDashB === 0 ? dashArray = `${obj.value}` : dashArray = `${obj.value} ${pathItem.strokeDashB}`;
         }
         else if(obj.name === "strokeDashB"){
            obj.value === 0 ? dashArray = `${pathItem.strokeDashA}` : dashArray = `${pathItem.strokeDashA} ${obj.value}`;
         }
         if((pathItem.strokeDashA === 0) && (pathItem.strokeDashB === 0)){
            dashArray ="none";
         }
         pathArray[index]["strokeDasharray"] = dashArray;//atualizo o dashArray
      }
      //console.log(obj.value);
      pathArray[index][obj.name] = obj.value;
      this.setState({svgPaths: pathArray});

   }
   
   selectPath=(pathId)=>{
      let pathArray = this.state.svgPaths;
      let pathItem = pathArray.find(item => item.uuid === pathId);
      let index = pathArray.indexOf(pathItem);
      this.setState({currentPathSelected: index});
   }
   
   // getPathIndex=(uuid)=>{
   //    let pathArray = this.state.svgPaths;
   //    let pathItem = pathArray.find(item => item.uuid === pathId);
   //    return pathArray.indexOf(pathItem);
   // }

   clearPath=(e)=>{
      this.toolsDicRef.noneTool.current.checked = true;
      let pathArray = this.state.svgPaths;
      this.saveHistory();
      pathArray[this.state.currentPathSelected].tokenList = [];
      this.setState({currentTool: "noneTool", commandExecution: ToolHelper.initTool("noneTool").command, svgPaths:pathArray, tempToken: null});
   }
   deletePath=(e)=>{
      if(this.state.svgPaths.length === 1) return;
      let pathArray = this.state.svgPaths;
      this.saveHistory();
      pathArray.splice(this.state.currentPathSelected, 1);
      let selected = this.state.currentPathSelected;
      if(selected > this.state.svgPaths.length - 1){
         selected = this.state.svgPaths.length - 1;
      }
      this.setState({svgPaths: pathArray, currentPathSelected: selected});
   }
   clonePath=(e)=>{
      if(this.state.svgPaths.length === 6){
         return;
      }
      let pathArray = this.state.svgPaths;
      this.saveHistory();
      let clonedPath = JSON.parse(JSON.stringify(this.state.svgPaths[this.state.currentPathSelected]));//preciso de uma deep copy
      clonedPath.pathName = clonedPath.pathName + "_c";
      clonedPath.uuid = crypto.randomUUID();

      pathArray.push(clonedPath);
      const selected = pathArray.length - 1;
      let arr = [];
      pathArray.map((item)=> arr.push(0));

      this.setState({svgPaths: pathArray, currentPathSelected: selected, translateArrayY: arr});

   }
   //#endregion


   //quero usar isso aqui pra um butao...
   
   updatePrxControl=(obj)=>{
      this.setState({[obj.name]: obj.value});
   }
   resetShapeOptions=(e)=>{
      this.setState({shapeWinding: "left", polygonSides: 3, rectCornerType: "none", rectFilletSize: 0})
   }
   
   handleFileInputChange=(e)=>{
      let obj = {};
      obj.name = this.fileInput.current.files[0].name;
      obj.file = URL.createObjectURL(this.fileInput.current.files[0])
      obj.type = this.fileInput.current.files[0].type;
      this.setState({loadedImage: obj.file, showIconImage: true});
   }

   //#region TokenViewer functions - Quem chama eh o TokenViewer
   removeTokenFromPath=(index)=>{
      if(index != -1){
         let newPaths = this.state.svgPaths;
         this.saveHistory();
         let path = newPaths[this.state.currentPathSelected];
         path.tokenList.splice(index, 1);
         this.setState({svgPaths: newPaths, highLightTokenIndex: -1});
      }
   }

   HighLightToken=(index)=>{
      this.setState({highLightTokenIndex: index});
   }
   updateTokenVariables=(options)=>{
      let alteredPaths = this.state.svgPaths;
      let token = alteredPaths[this.state.currentPathSelected].tokenList[options.tokenIndex];
      token.options[options.name] = options.value;
      this.setState({svgPaths: alteredPaths});
   }
   duplicateToken=(tokenIndex)=>{
      let alteredPaths = this.state.svgPaths;
      this.saveHistory();
      let tokenList = alteredPaths[this.state.currentPathSelected].tokenList;
      let newToken = JSON.parse(JSON.stringify(tokenList[tokenIndex]));//preciso de uma deep copy 
      tokenList.splice(tokenIndex, 0, newToken);//adicionei o token no next slot do layer
      this.setState({svgPaths: alteredPaths});
   }
   //#endregion

   
   
   

   render(){
      this.lines = [];
      this.circles = [];
      this.collisionPoints = [];
      this.anchorPoints = [];

      let paths = [];
      //build path objects
      for(let i =0; i < this.state.svgPaths.length; i++){
         let pathItem = this.state.svgPaths[i];
         if(pathItem.visible === true){
            let pathString = "";
            for(let k = 0; k < pathItem.tokenList.length; k++){
               let tokenID = {pathIndex: i, tokenIndex: k};
               //line circle e pontos soltos(rect e polygon)? e usar isso pra fazer os snaps
               pathString += TokenHelper.convertTokenToPathAndOrganize(pathItem.tokenList[k], this.lines, this.circles, this.anchorPoints, tokenID);
            }
            
            let finalPath = TokenHelper.removeDuplicateCommands(pathString);
            let pathObject = <path drawing={pathItem.pathName} strokeWidth={pathItem.strokeWidth}  strokeLinecap={pathItem.strokeLineCap} strokeLinejoin={pathItem.strokeLinejoin} 
               stroke={pathItem.strokeColor}
               vectorEffect={pathItem.vectorEffect}
               strokeDasharray={pathItem.strokeDasharray}
               fill={pathItem.usePathFill ? pathItem.pathFillColor : "none"}//"none" ou cor
               d={finalPath}
               key={crypto.randomUUID()}
            />
            paths.push(pathObject);
         }
      }
      
      this.buildCollisionPoints(this.lines, this.circles, this.collisionPoints);//line x line | circle x line | circle x circle
      
      //o temp draw de quando for criar um elemento
      let tempDraw = this.buildTempDraw(this.state.tempToken);
      
      //TokenViewer
      let tokenHighlightDraw = <></>;
      let TokenDisplay = <></>;
      if(this.state.svgPaths != undefined && this.state.svgPaths.length > 0){
         TokenDisplay = <TokenViewer
            tokens={this.state.svgPaths[this.state.currentPathSelected].tokenList}
            removeToken={this.removeTokenFromPath}
            HighlightToken={this.HighLightToken}
            updateToken={this.updateTokenVariables}
            shapeWindingList={this.props.shapeWindingList}
            rectCornerTypeList={this.props.rectCornerTypeList}
            duplicateToken={this.duplicateToken}
            displaceToken={this.displaceToken}
         />;
         if(this.state.highLightTokenIndex != -1 && this.state.highLightTokenIndex != undefined){
            let highLightToken = this.state.svgPaths[this.state.currentPathSelected].tokenList[this.state.highLightTokenIndex];
            let dotArray = [];
            let anchorRadius = 5 / this.state.scale;
            for (let i = 0; i < highLightToken.pontos.length; i++){
               let dot = <circle cx={highLightToken.pontos[i].x} cy={highLightToken.pontos[i].y} r={anchorRadius} fill={i === 0 ? "cyan" : "orange"} stroke="black"
                  strokeWidth={1} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                  />
                  dotArray.push(dot)
            }
            let highlightPath = TokenHelper.convertTokenToPath(highLightToken);
            tokenHighlightDraw = <>
               <path strokeWidth={2} stroke="#e67d15" vectorEffect="non-scaling-stroke" d={highlightPath} key={crypto.randomUUID()} />
               {dotArray}
            </>
         }
      }
                  


      //#region setup e tal
      const props = this.props;
      
      const drawAreaSize = this.props.drawAreaSize;
      const canvasSizeX = this.state.viewBoxWidth;
      const canvasSizeY = this.state.viewBoxHeight;
      const scale = this.state.scale;
      
      let posX = ((drawAreaSize - (canvasSizeX * scale)) / 2) + this.state.offsetDisplayX;
      let posY = (drawAreaSize - (canvasSizeY * scale)) / 2 + this.state.offsetDisplayY;
      
      const svgAreaStyle = {
         position:"absolute",
         left: `${posX}px`,
         top: `${posY}px`,
         width: `${canvasSizeX * scale}px`,
         height: `${canvasSizeY * scale}px`,
         zIndex: 10,
      }
      
      
      let rulerX_width = canvasSizeX * scale;
      let rulerX_posX = ((drawAreaSize - rulerX_width) / 2) + this.state.offsetDisplayX;
      
      //mmc? mdc?
      const nSegmentsX = this.state.rulerDivision;
      const divisionPerSegment = this.state.rulerSubdivision;
      let sizePerDivision = drawAreaSize/divisionPerSegment;
      
      let currentZoomSizeX = canvasSizeX * scale;
      let ratioCurrrentZoomSizeX = currentZoomSizeX / drawAreaSize;
      let currentDivisionSizeX = ((drawAreaSize / nSegmentsX) / divisionPerSegment) * ratioCurrrentZoomSizeX;
      
      let bg_x_Size = scale;
      if(scale < 4){
         bg_x_Size = bg_x_Size * 2;
      }
      let divisionX = [];
      let data_accX = (canvasSizeX / nSegmentsX);
      let acrescimoX = data_accX * scale;
      for(let i = 0; i < nSegmentsX + 1; i++){
         divisionX.push(<li className='absolute f100 majorLineX' style={{left:`${i * acrescimoX}px`}}
          data-value={window.utils.RoundNumber(i * data_accX, 2)}
          key={crypto.randomUUID()}></li>);
      }
      let rulerX = <div className="el300 b-bot300" style={{gridColumn: "2 / 3", gridRow: "1 / 2", overflow:"hidden"}}>
         <div className="ruler-x relative"
            style={{left:`${rulerX_posX}px`, width:`${rulerX_width + 1}px`, backgroundSize:`${currentDivisionSizeX}px 10px`}}
            >
            <div className="ruler-x2" style={{left:`${rulerX_posX}px`, width:`${rulerX_width}px`, backgroundSize:`${bg_x_Size / 2}px 15px`}} />
            <ul className='relative'>
               {divisionX}
            </ul>
         </div>
      </div>
   
      



      let bg_y_Size = scale;
      if(scale < 4){
         bg_y_Size = bg_y_Size * 2;
      }
      let nSegmentsY = nSegmentsX;
      let currentZoomSizeY = canvasSizeY * scale;
      let ratioCurrrentZoomSizeY = currentZoomSizeY / drawAreaSize;
      let currentDivisionSizeY = ((drawAreaSize / nSegmentsY)) * ratioCurrrentZoomSizeY;
      
      let rulerY_height = canvasSizeY * scale;
      let rulerY_posY = ((drawAreaSize - rulerY_height) / 2) + this.state.offsetDisplayY;
      let divisionY = [];
      let data_accY = (canvasSizeY / nSegmentsY);
      let acrescimoY = data_accY * scale;
      for(let i = 0; i < nSegmentsY + 1; i++){
         divisionY.push(<li className='absolute f100 majorLineY' style={{top:`${(i * acrescimoY) - rulerY_height - 1}px`}}
         data-value={window.utils.RoundNumber(i * data_accY, 3)}
         key={crypto.randomUUID()}></li>);
      }
      let rulerY = <div className="el300" style={{gridColumn: "1 / 2", gridRow: "2 / 3", overflow:"hidden"}}>
         <div className="ruler-y relative" style={{top:`${rulerY_posY}px`, height:`${rulerY_height}px`, backgroundSize:`10px ${currentDivisionSizeY}px`}}>
            <div className="ruler-y2" style={{top:`${rulerY_posY}px`, height:`${rulerY_height}px`, backgroundSize:`15px ${bg_y_Size / 2}px`}}></div>
            <ul className='relative'>
               {divisionY}
            </ul>
         </div>
      </div>
      




      let leftBarWidth = "116px";
      let labelStyle_sm = {
         width: "40px",
         fontSize:"10px",
         margin:"0px 5px",
         userSelect: "none",
      }

      
      //#endregion
      let mainButtonClassName = "radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor";
      let mainButtonStyle = {
         width:"48px", height:"18px", fontSize:"10px", textAlign:"center",
      }

      let LabelStyleClass = "f100 noselect"
      let LabelStyleForToogle={
         fontSize:"11px",
      }


      //1 unit quantos pixels? 
      //karina23

      //let data_accX = (canvasSizeX / nSegmentsX);
      //let acrescimoX = data_accX * scale;
      //no width > height e 32 -> canvasSizeX / 8 
      let gridDisplayCellSpacing = (canvasSizeX / 8 * scale);//16 //2
      //eu preciso que o cellSpacing seja bom...
      let divisionCellGrid = 4;

      return (

         <div>
            <h3 style={{marginBottom:"3px", color:"white", height:"24px"}}>Svg Draw</h3>
            
            {/* Top bar */}
            <div className='topBar el200 flexRow' style={{height:"36px", marginBottom:"4px", padding:"6px 8px", gap:"6px"}}>
               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px", marginLeft:"16px"}} onClick={this.createNewDraw}>new draw</button>
               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px", marginLeft:"22px"}} onClick={()=> this.fileInput.current.click()}>upload img</button>
               <input style={{display:"none"}} id="forFile" ref={this.fileInput} type="file" name="file" onChange={this.handleFileInputChange} placeholder="image file" />
               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px"}} onClick={()=> this.setState({loadedImage : null})}>clear img</button>
               <PrxToggle valor={this.state.showIconImage} update={this.updatePrxControl} width="70px" height="100%" fontSize="9px" name="showIconImage" >
                  {this.state.showIconImage === true ?
                     <span className={LabelStyleClass} style={LabelStyleForToogle}>hide img</span> : 
                     <span className={LabelStyleClass} style={LabelStyleForToogle}>show img</span>
                  }
               </PrxToggle>
               
               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px", height:"24px", marginLeft:"10px"}} onClick={this.performUndo}>redo</button>

               <span className='f100 noselect' style={{padding:"3px 5px", height: "24px", marginLeft:"28px", fontSize:"13px"}}>svg name:</span>
               <input className="radius4 el200 b300 f200 cursor" style={{margin:"0 0px", fontSize:"11px", width:"124px", height:"24px", padding:"2px 5px"}}
                  value={this.state.svgName} name="svgName" onChange={this.inputUpdate} onKeyDown={this.inputHandleKeyDown} id="svgName" type="text"/>

               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px", marginLeft:"10px"}} onClick={this.saveSvgToLib}>save to lib</button>
               <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300' style={{padding:"3px 5px", width:"80px"}} onClick={this.openCloseLibrary}>
                  {this.state.iconLibraryOpen === true ? "close lib" : "open lib"}
                  </button>
               
            </div>
            <div className='flexRow' style={{gap:"4px"}}>
               
               {/* Side bar */}
               <div className="sidebar flexCol horcenter el200" style={{width:leftBarWidth, gap:"4px", height:"653px"}}>
                  
                  {/* view box */}
                  <span className='f100' style={{fontSize:"11px", fontWeight:"400", margin:"4px 0 0 0" }}>View Box</span>
                  <div className="flexCol b300" style={{width:"100%", gap:"4px", padding:"4px 4px", marginBottom:"4px"}}>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>width</label>   
                        <PrxSpinner update={this.updatePrxControl} valor={this.state.viewBoxWidth} name="viewBoxWidth"
                           decimals={1} minValue={8} maxValue={512} step={1} dragDistance={10}
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>height</label>   
                        <PrxSpinner update={this.updatePrxControl} valor={this.state.viewBoxHeight} name="viewBoxHeight"
                           decimals={1} minValue={8} maxValue={512} step={1} dragDistance={10}
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>ruler</label>   
                        <PrxSpinner update={this.updatePrxControl} valor={this.state.rulerDivision} name="rulerDivision"
                           decimals={1} minValue={2} maxValue={100} step={1} dragDistance={10}
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>subDiv</label>   
                        <PrxSpinner update={this.updatePrxControl} valor={this.state.rulerSubdivision} name="rulerSubdivision"
                           decimals={1} minValue={2} maxValue={512} step={1} dragDistance={10}
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>color</label>   
                        <button className="radius4 el200 b300 fwhite cursor"
                           data-name="stageBackgroundColor" onClick={this.stageColorSetup}
                           style={{fontSize:"11px", width:"40px", height:"20px"}}>
                              <div className="b500" style={{padding:"4px 4px", backgroundColor:this.state.stageBackgroundColor}} />
                        </button>
                     </div>
                     
                  </div>
                  
                  {/* draw creation tools */}
                  <span className='f100' style={{fontSize:"11px", fontWeight:"400"}}>Draw Tools</span>
                  <div className="flexRow horcenter b300" style={{width:"100%", gap:"6px", marginTop:"2px", marginBottom:"4px", flexWrap: "wrap", padding:"4px 0px"}}
                       //onChange={this.onToolChangeValue} //esse evento so eh fired quando eu clico ou mudo o radio na tag <input> ,se mudar via label nao trigger ele
                       >
                     <input ref={this.toolsDicRef.noneTool} className="displaynone" type="radio" id="noneTool" name="draw_Tools"/>
                     
                     <input className="toolInput displaynone" ref={this.toolsDicRef.moveTool} type="radio" id="moveToolIcon" name="draw_Tools"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="moveToolIcon" data-value="moveTool"
                       onClick={this.selectToolHandler}
                       >move (m)</div>

                     <input className="toolInput displaynone" ref={this.toolsDicRef.lineTool} type="radio" id="lineToolIcon" name="draw_Tools" value="line"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="lineToolIcon" data-value="lineTool"
                       onClick={this.selectToolHandler}
                       >line (l)</div>

                     <input className="toolInput displaynone" ref={this.toolsDicRef.circleTool} type="radio" id="circleTool" name="draw_Tools" value="circle"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="circleTool" data-value="circleTool"
                       onClick={this.selectToolHandler}
                       >circle (c)</div>
                     
                     <input className="toolInput displaynone" ref={this.toolsDicRef.circleEdgeTool} type="radio" id="circleEdgeTool" name="draw_Tools" value="circleE"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="circleEdgeTool" data-value="circleEdgeTool"
                       onClick={this.selectToolHandler}
                       >circle edge</div>

                     <input className="toolInput displaynone" ref={this.toolsDicRef.arcTool} type="radio" id="arcTool" name="draw_Tools" value="arc"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="arcTool" data-value="arcTool"
                       onClick={this.selectToolHandler}
                       >arc (a)</div>

                     <input className="toolInput displaynone" ref={this.toolsDicRef.bezierTool} type="radio" id="bezierTool" name="draw_Tools" value="bezier"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="bezierTool" data-value="bezierTool"
                       onClick={this.selectToolHandler}
                       >bezier (b)</div>



                     <input className="toolInput displaynone" ref={this.toolsDicRef.rectTool} type="radio" id="rectTool" name="draw_Tools" value="rect"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="rectTool" data-value="rectTool"
                       onClick={this.selectToolHandler}
                       >rect</div>

                     <input className="toolInput displaynone" ref={this.toolsDicRef.polygonTool} type="radio" id="polygonTool" name="draw_Tools" value="polygon"/>
                     <div className="labelSelect el200 f100 b300 h-el300 h-fwhite radius4 pointer flexCol vertcenter horcenter"
                       style={{width:"32px", height:"32px", fontSize:"9px"}} htmlFor="polygonTool" data-value="polygonTool"
                       onClick={this.selectToolHandler}
                       >poly</div>


                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between", margin:"6px 0px 0px 0px"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>winding</label>   
                        <PrxSelect  valor={this.state.shapeWinding} update={this.updatePrxControl} name={"shapeWinding"}
                           options={this.props.shapeWindingList} width="50px" height="20px" fontSize="11px" menuWidth="80px"/>  
                     </div>
                     
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>n-side</label>   
                        <PrxSpinner valor={this.state.polygonSides} update={this.updatePrxControl} name="polygonSides"
                           decimals={2} minValue={3} maxValue={20} dragDistance={80} step={1} label="n"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>chanfer</label>   
                        <PrxSelect  valor={this.state.rectCornerType} update={this.updatePrxControl} name={"rectCornerType"}
                           options={this.props.rectCornerTypeList} width="50px" height="20px" fontSize="11px" menuWidth="80px"/>  
                     </div>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>size</label>   
                        <PrxSpinner  valor={this.state.rectFilletSize} update={this.updatePrxControl} name="rectFilletSize"
                           decimals={2} minValue={0} maxValue={128} dragDistance={100} step={.01} label="u"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>
                     
                     <button className='anim100 cursor radius4 b300 el200 f100 h-fwhite h-el300'
                        style={{padding:"3px 5px", fontSize:"10px", width:"90%", marginBottom:"2px"}} onClick={this.resetShapeOptions} >reset options</button>
                     
                  </div>
                  

                  {/* snap tools */}
                  <div className='flexRow vertcenter' style={{width:"80%",  justifyContent:"space-between", marginTop:"5px"}}>
                        <label className="f100 noselect" style={{width: "50px",fontSize:"11px",margin:"0px 4px"}}>Snap (F4)</label>   
                        <PrxSwitch value={this.state.snap} update={this.updatePrxControl} name={"snap"} height="12px"/>
                  </div>

                  <div className="flexCol b300" style={{width:"100%", gap:"6px", padding:"4px 4px", marginBottom:"4px"}}>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "80px",fontSize:"10px",margin:"0px 4px"}}>endpoint (e)</label>   
                        <PrxSwitch value={this.state.snapToEndPoints} update={this.updatePrxControl} name={"snapToEndPoints"} height="11px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>midpoint</label>   
                        <PrxSwitch value={this.state.snapToMidPoints} update={this.updatePrxControl} name={"snapToMidPoints"} height="11px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "82lpx",fontSize:"10px",margin:"0px 4px"}}>intersect (i)</label>   
                        <PrxSwitch value={this.state.snapToIntersection} update={this.updatePrxControl} name={"snapToIntersection"} height="11px"/>
                     </div>
                     
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>grid (g)</label>   
                        <PrxSwitch value={this.state.snapToGrid} update={this.updatePrxControl} name={"snapToGrid"} height="11px"/>
                     </div>
                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>step</label>   
                        <PrxSpinner valor={this.state.snapGridStep} update={this.updatePrxControl}  name="snapGridStep"
                           decimals={2} minValue={0.1} maxValue={512} dragDistance={100} step={.01} label="u"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "50px",fontSize:"10px",margin:"0px 4px"}}>angle (n)</label>   
                        <PrxSwitch value={this.state.snapToAngle} update={this.updatePrxControl}  name={"snapToAngle"} height="11px"/>
                     </div>

                     <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"space-between"}}>
                        <label className="f100 noselect" style={{width: "30px",fontSize:"10px",margin:"0px 4px"}}>degree</label>   
                        <PrxSpinner valor={this.state.snapAngleStep} update={this.updatePrxControl} name="snapAngleStep"
                           decimals={2} minValue={0.1} maxValue={179} dragDistance={100} step={.01} label="a"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     </div>

                     

                     
                  </div>
                  <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{width:"90px", height:"20px", border:"1px solid grey"}} onClick={this.showGrid}>
                     {this.state.showGrid === true ? "hide grid" : "show grid"}
                     </button>
               </div>
               
               {/* Drawing Area / grid */}
               <div className='grid relative' style={{overflow:"hidden", width:`${drawAreaSize + 20}px`, gap:"2px",
                  gridTemplateColumns:`20px ${drawAreaSize}px`,
                  gridTemplateRows:`20px ${drawAreaSize}px 20px`, flexShrink:"0"
               }}>
                  {rulerX}
                  {rulerY}
                  
                  <div className='onfocus-outline0 el100 relative' style={{width:`${drawAreaSize}px`, height:`${drawAreaSize}px`, gridColumn:"2/3", gridRow:"2/3",
                              overflow:"hidden",
                              //backgroundColor:`${this.state.stageBackgroundColor}` //esse eh o background do canvas
                              }}
                              ref={this.canvasRef}
                              onContextMenu={this.preventRightClickOnStage}
                              onWheel={this.zoomArea}
                              onMouseMove={this.calcMouseSVGCanvasPosAndSnap}
                              onMouseDown={this.viewPanControlAndMoveToken}
                              onClick={this.drawAreaClickHandler}
                              onKeyDown={this.HandleKeyPressInView} tabIndex="-1" //coisas de react...pra fazer o keydown funcionar precisa usar isso
                              onMouseEnter={this.focusArea}
                              onMouseLeave={this.unfocusArea}
                              >

                     {/* o draw to svg em si, paths, os snappoints e tal */}
                     <div style={svgAreaStyle} >
                        {/* //view box eh o viewBoxWidth e viewBoxHeight*/}
                        <svg className='nomouse absolute b300' fill="none" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`} style={{backgroundColor:this.state.stageBackgroundColor}}>

                           {paths}

                           {/* pontos de snap de todos os paths visiveis this.buildSnapPointsDraw() */}
                           {this.buildSnapPointsDraw()}
                           
                           
                           {/* ghosting do current tool no creation */}
                           {tempDraw}

                           {/* highlight do token no tokenViewer */}
                           {tokenHighlightDraw}
                           
                        </svg>
                     </div>
                     
                     {/* grid overlay */}
                     {this.state.showGrid ? 
                        <div className="absolute nomouse"  style={{left: `${posX}px`, top: `${posY}px`, width: `${canvasSizeX * scale + 1}px`, height: `${(canvasSizeY * scale) + 1}px`,
                           backgroundImage: "linear-gradient(rgb(148, 148, 148, .3) 1px, transparent 0),\
                                             linear-gradient(90deg, rgb(148, 148, 148, .3) 1px, transparent 0),\
                                             linear-gradient(rgb(148, 148, 148, .1) 1px, transparent 0),\
                                             linear-gradient(90deg, rgb(148, 148, 148, .1) 1px, transparent 0)",
                           backgroundSize: `${gridDisplayCellSpacing}px ${gridDisplayCellSpacing}px ,\
                           ${gridDisplayCellSpacing}px ${gridDisplayCellSpacing}px ,\
                           ${gridDisplayCellSpacing / divisionCellGrid}px ${gridDisplayCellSpacing / divisionCellGrid}px ,\
                           ${gridDisplayCellSpacing / divisionCellGrid}px ${gridDisplayCellSpacing / divisionCellGrid}px`,

                           //main grid lines - tenho q melhorar isso
                           // backgroundImage: "linear-gradient(rgb(148, 148, 148, .6) 1px, transparent 0),\
                           //                   linear-gradient(90deg, rgb(148, 148, 148, .6) 1px, transparent 0)",
                           // backgroundSize: `${acrescimoX}px ${acrescimoX}px , ${acrescimoX}px ${acrescimoX}px`,
                           zIndex:13,//o svgAreaStyle tem zIndex de 10, isso eh pra grid ficar por cima do desenho
                        }}></div> : <div className="absolute"  style={{left: `${posX}px`, top: `${posY}px`, width: `${canvasSizeX * scale + 1}px`, height: `${(canvasSizeY * scale) + 1}px`}}></div>
                     
                     }
                     
                     {/* background image */}
                     {
                        //nao to usando <img> , pq quando fica null a imagem o elemento fica com uma borda esquisita
                        this.state.showIconImage && <div className="absolute" //src={this.state.loadedImage} //pra ficar sem o border, tem ou nao renderizar ou passar uma imagem transparente..tsc
                           style={{left: `${posX}px`, top: `${posY}px`, width: `${canvasSizeX * scale + 0}px`, height: `${(canvasSizeY * scale) + 0}px`,
                           backgroundImage: `url("${this.state.loadedImage}")`, backgroundRepeat:"no-repeat" , backgroundSize: `${canvasSizeX * scale + 1}px ${(canvasSizeY * scale) + 1}px`,
                        }}/>
                     }
                     
                  
                  </div>
                  
                  <div className="flexRow el3000" style={{gridColumn:"2/3", gridRow:"3/4", width:"100%", gap:"6px"}}>
                     <div className='flexRow horstart vertcenter' style={{width:"90%", gap:"5px"}}>
                        <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{height:"20px", border:"1px solid grey"}} onClick={this.saveView}>save</button>
                        <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{height:"20px", border:"1px solid grey"}} onClick={this.loadView}>load</button>
                        <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{width:"60px", height:"20px", border:"1px solid grey"}} onClick={this.resetStagePos}>center</button>
                        <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{minWidth:"60px", height:"20px", border:"1px solid grey"}} onClick={this.resetZoom}>original</button>
                        <button className="radius4 el200 h-el300 f100 h-fwhite pointer" style={{minWidth:"60px", height:"20px", border:"1px solid grey"}} onClick={this.zoomToFill}>fill</button>
                        <div className="b200 f200 flexRow horcenter vertcenter legenda relative"
                           data-value="z:" style={{height:"18px", width:"60px", fontSize:"11px", marginLeft:"10px"}}>{`${window.utils.RoundNumber(this.state.scale * 100, 0)} %`}
                        </div>
                     </div>
                     <div className='flexRow vertcenter horend' style={{width:"50%", gap:"15px", marginRight:"4px"}}>
                        <div className="b200 f200 flexRow vertcenter legenda relative" data-value="x:" style={{width:"40px", height:"18px", fontSize:"11px"}}>{`${this.state.svgMousePosX}`}</div>
                        <div className="b200 f200 flexRow vertcenter legenda relative" data-value="y:" style={{width:"40px", height:"18px", fontSize:"11px"}}>{`${this.state.svgMousePosY}`}</div>

                     </div>
                  </div>
                  
                  {/* display do result em diferentes resolucoes - parte de baixo do stage*/}
                  <div className='el200' style={{gridColumn:"1/3", gridRow:"4/5", height:"80px", marginTop:"15px"}}>
                     <div className='flexRow relative' style={{gap:"0px"}}>
                        <div className='absolute' style={{width:"10px", height:"10px", left:"5px", top:"-5px"}}>
                           <svg className='b300' fill="none" width="10" height="10" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
                              {paths}
                           </svg>
                        </div>
                        <div style={{width:"32px", height:"64px", marginLeft:"28px"}}>
                           <svg className='b300' fill="none" width="16" height="16" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
                              {paths}
                           </svg>
                        </div>
                        <div style={{width:"48px", height:"64px"}}>
                           <svg className='b300' fill="none" width="32" height="32" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
                              {paths}
                           </svg>
                        </div>
                        <div style={{width:"64px", height:"64px"}}>
                           <svg className='b300' fill="none" width="48" height="48" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
                              {paths}
                           </svg>
                        </div>
                        <div style={{width:"64px", height:"64px"}}>
                           <svg className='b300' fill="none" width="64" height="64" viewBox={`0 0 ${this.state.viewBoxWidth} ${this.state.viewBoxHeight}`}>
                              {paths}
                           </svg>
                        </div>
                        
                     </div>
                     <span className='f100' style={{fontSize:"11px", whiteSpace:"pre"}}>10  16    32px    48px       64px</span>
                  </div>

               </div>
               
                     

               {/* library icons */}
               {
                  this.state.iconLibraryOpen === true && <IconLibrary loadSvgFromLib={this.loadSvgFromLib}/>
               }
               
               {/* Layer Area e Token  */}
               {
               this.state.iconLibraryOpen === false &&
                  <div className='flexCol' style={{gap:"0px", width:"600px"}}>
                     <p className='f100 noselect' style={{height: "17px", marginBottom:"0px", whiteSpace:"pre"}}> Layers</p>
                     <div className="flexRow b-top300" style={{width:"100%", gap:"4px", padding:"4px 4px"}}>
                        <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.AddNewPath}>add</button>
                        <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.clearPath}>clear</button>
                        <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.clonePath}>clone</button>
                        <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.deletePath}>delete</button>
                        <button className={mainButtonClassName} style={mainButtonStyle} onClick={this.openMovePathWindow}>Δ pos</button>
                        <button className={mainButtonClassName} style={{...mainButtonStyle, width:"60px"}} onClick={this.openSvgStringWindow}>svg code</button>
                           
                     </div>

                     <div className='el200 relative' style={{height:"182px", marginTop:"0px"}}>
                        <pre className='f100 b-bot300 noselect relative' style={{fontSize:"11px", marginTop:"3px", marginBottom:"2px", paddingBottom:"3px"}}
                        //essas distancias sao pra font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
                        >      name            width  color   linejoin   cap       fill  color  linescale  dash</pre>

                        <div className='relative' style={{height:`${this.state.svgPaths.length * 26}px`, top:"0px"}} ref={this.dragListRef} onMouseDown={this.dragListDown}>
                        {
                           this.state.svgPaths.map( (pathItem, index) => <LayerSlot path={pathItem}
                                 updatePath={this.updatePathProperties}
                                 deletePath={this.deletePath}
                                 selectPath={this.selectPath}
                                 isSelected={this.state.currentPathSelected === index ? true : false}
                                 index={index}
                                 svgOptions={this.props.svgPathOptions}
                                 key={pathItem.uuid}
                                 openColorPicker={this.openColorPicker}
                                 
                                 zIndex={this.state.currentPathSelected === index ? 10 : 0}
                                 translateY={this.state.translateArrayY[index]}
                                 dragging={this.state.isPerformingDrag} //???
                                 />
                              
                           )
                        }
                        </div>
                     </div>
                     
                     {TokenDisplay}
                     
                  </div>
               }



               {/* displace path - x,y */}
               {this.state.boolWindows.displaceMenuOpen &&
                  <div className='fixedFull' ref={this.fixedWindowsRef.displaceWindow} onKeyDown={this.fixedHandleEscKey} tabIndex="-1"
                     style={{zIndex:"999"}} onMouseDown={this.closeFullScreenFixedWindows} >
                     <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:"150px", height:"88px", left:`${865}px`, top:`${110}px`}}>
                        <span className="f100 noselect" style={{fontSize:"11px", margin:"0px 0px 0 5px"}}>Displace path</span>
                        <div className='el100 absolute ' style={{width:"59px", height:"59px", left:"7px", top:"21px",
                                 backgroundImage:"linear-gradient(#626268 1px, transparent 0), \
                                                linear-gradient(90deg, #626268 1px, transparent 0), \
                                                linear-gradient(#2f2f33 1px, transparent 0), \
                                                linear-gradient(90deg, #2f2f33 1px, transparent 0)",
                                 backgroundSize: "29px 29px, 29px 29px, 15px 15px, 15px 15px",
                              
                              }} onMouseDown={this.displacePathFromMovingHandle}>
                           <div className='el100 absolute radiusfull' style={{width:"5px", height:"5px",
                              left:`calc(${(this.state.pathDisplaceHandlePosX * 59)}px - 3px)`,
                              top:`calc(${(this.state.pathDisplaceHandlePosY * 59)}px - 3px)`,
                              backgroundColor:"#a9b8ff", }}>

                           </div>
                        </div>

                     <PrxSpinner valor={this.state.pathDisplaceX} update={this.displacePathFromInput} name="pathDisplaceX"
                        decimals={2} minValue={this.state.viewBoxHeight * -0.5} maxValue={this.state.viewBoxHeight * 0.5} step={0.01} dragDistance={40} label="x"
                        fontSize="11px" maxWidth="66px" maxHeight="18px" position="absolute" left="74px" top="28px"/>

                     <PrxSpinner valor={this.state.pathDisplaceY} update={this.displacePathFromInput} name="pathDisplaceY" 
                        decimals={2} minValue={this.state.viewBoxHeight * -0.5} maxValue={this.state.viewBoxHeight * 0.5} step={0.01} dragDistance={40} label="y"
                        fontSize="11px" maxWidth="66px" maxHeight="18px" position="absolute" left="74px" top="56px"/>
                     </div>
                  </div>
               }
   
               {/* html e react svg strings */}
               {this.state.boolWindows.svgCodeWindowOpen &&
                  <div className='fixedFull' ref={this.fixedWindowsRef.svgCodeWindow} onKeyDown={this.fixedHandleEscKey} tabIndex="-1"
                     style={{zIndex:"999", backgroundColor:"rgba(0,0,0,.5)", backdropFilter:"blur(5px)"}}
                     onMouseDown={this.closeFullScreenFixedWindows} >
                     <div className="absolute el100 radius4" style={{padding:"20px 20px", width:"90vw", maxHeight:"600px", left:"5vw", top:"200px", overflow:"auto"}}>
                        <div className='flexRow vertcenter' style={{marginBottom:"8px", gap: "5px"}}>
                           <p className='f100' style={{fontSize:"15px"}}>React:</p>
                           <button className={mainButtonClassName} style={{width:"80px", height:"21px", textAlign:"center"}} onClick={this.copyToClipboardReact}>clipboard</button>
                        </div>
                        <div className='f100' style={{fontSize:"14px", lineHeight:"1.25"}}>{this.state.svgIconStrings.svgHeaderReact}</div>
                        {
                           this.state.svgIconStrings.svgBodyReact.map( (item) => 
                              <div className='f100' style={{fontSize:"14px", marginLeft:"16px", lineHeight:"1.25"}} key={crypto.randomUUID()}>{item}</div>
                           )
                        }
                        <div className='f100' style={{fontSize:"14px", whiteSpace:"normal", marginBottom:"20px"}}>{this.state.svgIconStrings.endSvg}</div>
                        

                        <div className='flexRow vertcenter' style={{marginBottom:"4px", gap: "5px"}}>
                           <p className='f100' style={{fontSize:"15px"}}>Html:</p>
                           <button className={mainButtonClassName} style={{width:"80px", height:"21px", textAlign:"center"}} onClick={this.copyToClipboardHtml}>clipboard</button>
                        </div>
                        <div className='f100' style={{fontSize:"14px", lineHeight:"1.25"}}>{this.state.svgIconStrings.svgHeaderHtml}</div>
                        {
                           this.state.svgIconStrings.svgBodyHtml.map( (item) => 
                              <div className='f100' style={{fontSize:"14px", marginLeft:"16px", lineHeight:"1.25"}} key={crypto.randomUUID()}>{item}</div>
                           )
                        }
                        <div className='f100' style={{fontSize:"14px", whiteSpace:"normal", marginBottom:"20px"}}>{this.state.svgIconStrings.endSvg}</div>
                        
                     </div>
                     <button className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor absolute"
                        style={{height:"20px", left:"calc(5vw - 10px)", top:"calc(200px - 10px)"}} onClick={this.closeWindowClick}>close (esc)</button>
                  </div>
               }

               {/* confirm de save caso o nome seja igual */}
               {this.state.boolWindows.saveConfirmationPopup &&
                  <div className='fixedFull' ref={this.fixedWindowsRef.saveWindow} onKeyDown={this.fixedHandleEscKey} tabIndex="-1"
                     style={{zIndex:"999", backgroundColor:"rgba(0,0,0,.2)", backdropFilter:"blur(5px)"}} onMouseDown={this.closeFullScreenFixedWindows} >
                     <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:"180px", height:"88px", left:`${545}px`, top:`${110}px`}}>
                        <span className="f100 noselect" style={{fontSize:"11px", margin:"0px 0px 0 5px"}}>Icon name already exists:</span>
                        <span className="f100 noselect" style={{fontSize:"11px", margin:"0px 0px 0 5px"}}>Overwrite Icon ?</span>
                         
                        <div className='flexRow horcenter' style={{marginTop:"16px", gap:"14px"}}>
                           <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} data-allowsave="true" onClick={this.saveSvgToLib}>YES</button>
                           <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} onClick={this.closeWindowClick}>NO</button>
                        </div>
                     </div>
                  </div>
               }

            </div>
            
            {this.state.openColorPicker &&
               <PrxColorPicker valor={this.state.pickerSetup.startingColor} name={this.state.pickerSetup.nameForColor} updateColor={this.updateColor}/>
            }

            <MessageBox />
            
         </div>
      );
   }

   //#region color edit - window
   updateColor=(obj)=>{
      if(this.state.pickerSetup.pathUUID === "stageColor"){
         this.setState({[obj.name]: obj.value});
      }
      else{
         this.updatePathProperties(obj, this.state.pickerSetup.pathUUID);
      }
      this.setState({openColorPicker: false});
   }
   openColorPicker=(pickerSetup)=>{
      this.setState({openColorPicker: true, pickerSetup: pickerSetup});
   }
   stageColorSetup=(e)=>{
      let colorName = e.currentTarget.getAttribute("data-name");
      let pickerSetupObj = {
         nameForColor: colorName,
         startingColor: this.state.stageBackgroundColor,
         pathUUID: "stageColor",
      }
      this.openColorPicker(pickerSetupObj);
   }
   //#endregion


   openCloseLibrary=()=>{
      this.setState({iconLibraryOpen: !this.state.iconLibraryOpen});
   }

   //#region Full Svg Path String --- copy clipboard e tal
   fixedHandleEscKey=(e)=>{
      if(e.key === "Escape"){
         if(this.state.boolWindows.displaceMenuOpen){
            if(this.state.pathDisplaceX === 0 && this.state.pathDisplaceY === 0){
               this.state.history.pop();
            }
         }
         let windowsClosed = this.state.boolWindows;
         for (const key in windowsClosed) {
            windowsClosed[key] = false;
         }
         this.setState({boolWindows: windowsClosed});
      }
   }

   openSvgStringWindow=(e)=>{
      let reactSvgString = BuildSvgString(this.state.viewBoxWidth, this.state.viewBoxHeight, this.state.svgPaths);
      let boolWindows = this.state.boolWindows;
      boolWindows.svgCodeWindowOpen = true;
      this.setState({boolWindows: boolWindows, svgIconStrings: reactSvgString}, () => this.fixedWindowsRef.svgCodeWindow.current.focus());
   }
   
   closeWindowClick=(e)=>{
      //hack pra evitar de salvar o history se o cara nao mexeu no displace
      if(this.state.boolWindows.displaceMenuOpen){
         if(this.state.pathDisplaceX === 0 && this.state.pathDisplaceY === 0){
            this.state.history.pop();
         }
      }
      let windowsClosed = this.state.boolWindows;
      for (const key in windowsClosed) {
         windowsClosed[key] = false;
      }
      this.setState({boolWindows: windowsClosed});
   }

   copyToClipboardReact=(e)=>{
      this.sendMessageEvent(e, `react svg copied!`);
      navigator.clipboard.writeText(this.state.svgIconStrings.reactString);
   }
   copyToClipboardHtml=(e)=>{
      this.sendMessageEvent(e, `html svg copied!`);
      navigator.clipboard.writeText(this.state.svgIconStrings.htmlString);
   }
   
   //#endregion


   openMovePathWindow=(e)=>{
      //save o displace before do path
      //so abrir se o path conter elementos
      if(this.state.svgPaths[this.state.currentPathSelected].tokenList.length === 0 ){
         this.sendMessageEvent(e, `layer has no objects!`);
         return;
      }
      this.saveHistory();
      let tokenListForDisplacement = JSON.parse(JSON.stringify(this.state.svgPaths[this.state.currentPathSelected].tokenList));//preciso de uma deepCopy
      let windowBool = this.state.boolWindows;
      windowBool.displaceMenuOpen = true;
      this.setState({boolWindows: windowBool, tempTokenListForDisplacement: tokenListForDisplacement, pathDisplaceX: 0, pathDisplaceY:0, pathDisplaceHandlePosX: 0.5, pathDisplaceHandlePosY: 0.5},
         () => this.fixedWindowsRef.displaceWindow.current.focus());
   }

   closeFullScreenFixedWindows=(e)=>{
      if(e.button === 0){
         if(e.target === e.currentTarget){
            const startTime = Date.now();
            const closePathMoveMenu = (e) => {
               let deltaTime = Date.now() - startTime;
               if(deltaTime < 120){
                  if(this.state.boolWindows.displaceMenuOpen){
                     if(this.state.pathDisplaceX === 0 && this.state.pathDisplaceY === 0){
                        this.state.history.pop();
                     }
                  }

                  let windowsClosed = this.state.boolWindows;
                  for (const key in windowsClosed) {
                     windowsClosed[key] = false;
                  }

                  
                  this.setState({boolWindows: windowsClosed});
               }
               document.removeEventListener('mouseup', closePathMoveMenu);
               if (!this._isMouseDown) return;
               this._isMouseDown = false;
            }
            document.addEventListener('mouseup', closePathMoveMenu);
         }
      }
   }

   displacePathFromMovingHandle=(e)=>{
      //mouse down//move //up ...displace e tal...
      if(e.button === 0){
         const startTime = Date.now();

         const stageSize = 59;
         const stageRect = e.currentTarget.getBoundingClientRect();
         let moved = false;
         const moveDisplacementPathHandle = (e) =>{
            const localPosX = e.clientX - stageRect.x;
            const localPosY = e.clientY - stageRect.y;
            const normX = window.utils.ClampNumber(localPosX / stageSize, 0, 1);
            const normY = window.utils.ClampNumber(localPosY / stageSize, 0, 1);
            const deltaX = normX - 0.5;
            const deltaY = normY - 0.5;
            const finalDisplaceX = window.utils.RoundNumber(deltaX * this.state.viewBoxWidth, 2);
            const finalDisplaceY = window.utils.RoundNumber(deltaY * this.state.viewBoxHeight, 2);
            moved = true;
            this.setState({pathDisplaceHandlePosX: normX, pathDisplaceHandlePosY: normY, pathDisplaceX: finalDisplaceX, pathDisplaceY: finalDisplaceY},
               () => this.displacePath(this.state.tempTokenListForDisplacement, finalDisplaceX, finalDisplaceY));
         }

         const endDisplacementPathHandle = (e) => {
            let deltaTime = Date.now() - startTime;
            if(moved === false){
               const localPosX = e.clientX - stageRect.x;
               const localPosY = e.clientY - stageRect.y;
               const normX = window.utils.ClampNumber(localPosX / stageSize, 0, 1);
               const normY = window.utils.ClampNumber(localPosY / stageSize, 0, 1);
               const deltaX = normX - 0.5;
               const deltaY = normY - 0.5;
               const finalDisplaceX = deltaX * this.state.viewBoxWidth;
               const finalDisplaceY = deltaY * this.state.viewBoxHeight;
               this.setState({pathDisplaceHandlePosX: normX, pathDisplaceHandlePosY: normY, pathDisplaceX: finalDisplaceX, pathDisplaceY: finalDisplaceY},
                  () => this.displacePath(this.state.tempTokenListForDisplacement, finalDisplaceX, finalDisplaceY));
            }
            if(deltaTime < 120){
                  
            }
            document.removeEventListener('mousemove', moveDisplacementPathHandle);
            document.removeEventListener('mouseup', endDisplacementPathHandle);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
         }
         document.addEventListener('mousemove', moveDisplacementPathHandle);
         document.addEventListener('mouseup', endDisplacementPathHandle);
      
      }

   }


   displacePathFromInput=(obj)=>{
      let maxDisplacementX = this.state.viewBoxWidth * 1;//se mexer nessa multiplier tem que alterar os max e min valores dos spinners
      let maxDisplacementY = this.state.viewBoxHeight * 1;//se mexer nessa multiplier tem que alterar os max e min valores dos spinners
      if(obj.name === "pathDisplaceX"){
         let repeatDisplaceY = this.state.pathDisplaceY;
         let newDisplaceNormX = (obj.value / maxDisplacementX) + 0.5;
         this.setState({[obj.name]: obj.value, pathDisplaceHandlePosX: newDisplaceNormX, pathDisplaceY: repeatDisplaceY},
            () => this.displacePath(this.state.tempTokenListForDisplacement, obj.value, repeatDisplaceY));
      }
      else if(obj.name === "pathDisplaceY"){
         let repeatDisplaceX = this.state.pathDisplaceX;
         let newDisplaceNormY = (obj.value / maxDisplacementY) + 0.5;
         this.setState({[obj.name]: obj.value, pathDisplaceHandlePosY: newDisplaceNormY, pathDisplaceX: repeatDisplaceX},
            () => this.displacePath(this.state.tempTokenListForDisplacement, repeatDisplaceX, obj.value));
      }
   }


   //Essa aqui nao ta com arrow function...
   displacePath=(startPositions, displaceX, displaceY)=>{
      let allPaths = this.state.svgPaths;
      let pathSelected = allPaths[this.state.currentPathSelected];
      for(let i = 0; i < pathSelected.tokenList.length; i++){
         let token = pathSelected.tokenList[i];
         for(let k = 0; k < token.pontos.length; k++){
            token.pontos[k].x = startPositions[i].pontos[k].x + displaceX;
            token.pontos[k].y = startPositions[i].pontos[k].y + displaceY;
         }   
      }
      this.setState({svgPaths: allPaths});//se bobear guardar o state anterior pra poder fazer undo ?!
   }

   //token viewer
   displaceToken=(tokenIndex, startPositions, displaceX, displaceY)=>{
      
      let indexPath = this.state.currentPathSelected;
      let allPaths = this.state.svgPaths;
      let pathSelected = allPaths[indexPath];
      let tokenList = pathSelected.tokenList;
      let token = pathSelected.tokenList[tokenIndex];

      for(let i = 0; i < token.pontos.length; i++){
         token.pontos[i].x = startPositions[i].x + displaceX;
         token.pontos[i].y = startPositions[i].y + displaceY;
      }
      this.setState({svgPaths: allPaths});
   }



   //drawing function quando esta criando um token
   buildTempDraw=(token)=>{
      if(token === null) return <></>;

      let strokePixel = 1.2; //1 / this.state.scale; //se usar o vectorEffect={"non-scaling-stroke"} no svg
      let anchorRadius = 4 / this.state.scale;//esse tem q ser assim mesmo
      let resultDraw = <></>;

      let myConfig = {
         strokePixel: strokePixel,
         anchorRadius: anchorRadius,
         svgMousePosX: this.state.svgMousePosX,
         svgMousePosY: this.state.svgMousePosY,
         scale: this.state.scale,

         winding: this.state.shapeWinding,
         polygonSides: this.state.polygonSides,
         cornerType: this.state.rectCornerType,
         filletSize: this.state.rectFilletSize,
         
         
      }
      let resultadoDraw = <></>;
      resultadoDraw = ToolHelper.tools[this.state.currentTool].DrawingFunction(token, myConfig)

      return resultadoDraw;

      
   }

   //self explanatory - prevent right click no stage
   preventRightClickOnStage=(e)=>{
      e.preventDefault();
   }

   
   //essa funcao eh quando clika no icone de uma tool
   selectToolHandler=(e)=>{
      let toolSelected = e.target.getAttribute("data-value");//ou currentTarget?
      let result = ToolHelper.initTool(toolSelected, this.getShapeOptions());
      if(toolSelected != "moveTool"){
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
      else{
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token, snap:true, snapToEndPoints: true}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
   
   }

   getShapeOptions=()=>{
      const shapeOptions = {
         winding: this.state.shapeWinding,
         polygonSides: this.state.polygonSides,
         cornerType: this.state.rectCornerType,
         filletSize: this.state.rectFilletSize,
      }
      return shapeOptions
   }
   
   HandleKeyPressInView=(e)=>{

      let toolSelected = "noneTool";
      //console.log(e);
      // if(e.key === "ShiftLeft"){//"ControlLeft"
      
      // }
      if(e.key === "e"){//endpoint snap
         let snap = this.state.snap;
         if(snap === false){
            snap = true;
         }
         this.setState({snapToEndPoints: !this.state.snapToEndPoints, snap: snap});
      }
      else if(e.key === "n"){//angle snap
         let snap = this.state.snap;
         if(snap === false){
            snap = true;
         }
         this.setState({snapToAngle: !this.state.snapToAngle, snap: snap});
      }
      else if(e.key === "i"){//intersection snap
         let snap = this.state.snap;
         if(snap === false){
            snap = true;
         }
         this.setState({snapToIntersection: !this.state.snapToIntersection, snap: snap});
      }
      else if(e.key === "g"){//grid snap
         let snap = this.state.snap;
         if(snap === false){
            snap = true;
         }
         this.setState({snapToGrid: !this.state.snapToGrid, snap: snap});
      }
      else if(e.key === "F4"){//snap function
         this.setState({snap: !this.state.snap});
      }


      if(e.key === "Delete"){
         if(this.state.currentTool === "moveTool" || this.state.currentTool === "noneTool"){
            if(this.state.highLightTokenIndex != -1){
               if(this.state.movePointIdentifier.tokenIndex === -1){
                  //deleta o token
                  this.removeTokenFromPath(this.state.highLightTokenIndex);
               }
            }
         }
         
      }
      

      if(e.key === "z"){
         if(e.ctrlKey === true){//modifier -> ctrlKey ou shiftKey
            //console.log("fazer um UNDO.")
            this.performUndo();
         }
      }
      
      else if(e.key === "Escape"){//cancel command
         let toolSelected = "noneTool";
         let result = ToolHelper.initTool(toolSelected);
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, ()=> this.toolsDicRef[toolSelected].current.checked = true);
      }
      else if(e.key === "m"){//move command
         let toolSelected = "moveTool";
         let result = ToolHelper.initTool(toolSelected);
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token,
            snap:true, snapToEndPoints: true}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
      else if(e.key === "l"){//line command
         toolSelected = "lineTool";
         let result = ToolHelper.initTool(toolSelected, this.getShapeOptions());
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, () => this.toolsDicRef[toolSelected].current.checked = true);

      }
      else if(e.key === "c"){//circle command
         toolSelected = "circleTool";
         let result = ToolHelper.initTool(toolSelected, this.getShapeOptions());
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
      else if(e.key === "a"){//arc command
         toolSelected = "arcTool";
         let result = ToolHelper.initTool(toolSelected, this.getShapeOptions());
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
      else if(e.key === "b"){//bezier command
         toolSelected = "bezierTool";
         let result = ToolHelper.initTool(toolSelected, this.getShapeOptions());
         this.setState({currentTool: result.toolSelected, commandExecution: result.command, tempToken: result.token}, () => this.toolsDicRef[toolSelected].current.checked = true);
      }
      else if(e.key === "Enter"){//confirm command
         //ver se o this.toolKeyHandler[this.state.currentTool] tem alguma coisa;
         if(this.state.currentTool === "lineTool"){
            toolSelected = "noneTool";
            //complete o command
            if(this.state.tempToken.pontos.length > 1){
               let arrayObjects = this.state.svgPaths;
               this.saveHistory();
               arrayObjects[this.state.currentPathSelected].tokenList.push(this.state.tempToken);
               this.setState({currentTool: "noneTool", commandExecution: ToolHelper.initTool("noneTool").command, svgPaths: arrayObjects, tempToken: null},
                              ()=> this.toolsDicRef[toolSelected].current.checked = true);
            }
            else{//se tiver 0 ou 1 ponto na linha
               this.setState({currentTool: "noneTool", commandExecution: ToolHelper.initTool("noneTool").command, tempToken: null},
                              ()=> this.toolsDicRef[toolSelected].current.checked = true);
            }
         }
         else if(this.state.currentTool === "circleTool"){
            toolSelected = "noneTool";
            //se tiver no ultimo click, finaliza com o this.state.svgMousePosX, else //cancela o commando e volta pro none tool
            if(this.state.tempToken.pontos.length === 1){
               let updateTempToken = this.state.tempToken;
               updateTempToken.pontos.push({x: this.state.svgMousePosX, y: this.state.svgMousePosY});

               let arrayObjects = this.state.svgPaths;
               this.saveHistory();
               arrayObjects[this.state.currentPathSelected].tokenList.push(this.state.tempToken);
               this.setState({currentTool: "noneTool", commandExecution: ToolHelper.initTool("noneTool").command, svgPaths: arrayObjects, tempToken: null},
                              ()=> this.toolsDicRef[toolSelected].current.checked = true);
            }
            else{
               this.setState({currentTool: "noneTool", commandExecution: ToolHelper.initTool("noneTool").command, tempToken: null},
                              ()=> this.toolsDicRef[toolSelected].current.checked = true);
            }
         }
         else if(this.state.currentTool === "noneTool"){
            //ver o lastToolSelected e repeat o command ?
         }
         
      }

   }
   
   //#region history functions - undo
   saveHistory=()=>{
      let newHistory = this.state.history;
      if(newHistory.length > 3){
         newHistory.shift();//tira o primeiro elemento, e mutate a array (altera o this);
      }
      let historyObj = {svgPath: JSON.parse(JSON.stringify(this.state.svgPaths)), pathSelected: this.state.currentPathSelected};
      newHistory.push(historyObj);
      this.setState({history: newHistory});
   }
   removeHistoryPoint=()=>{
      this.state.history.pop();
   }
   resetHistory=()=>{
      this.setState({history: []});
   }
   performUndo=(e)=>{
      if(this.state.history.length > 0){
         let oldState = this.state.history.pop();
         this.setState({svgPaths: oldState.svgPath, currentPathSelected: oldState.pathSelected});
      }
   }
   //#endregion


   //handler de click no view...tools...
   drawAreaClickHandler=(e)=>{
      if(this.state.currentTool === "noneTool" || this.state.currentTool === "moveTool"){
         return;
      }
      const result = this.state.commandExecution.update();//0 ainda falta clicks, 1 => falta um click
      if(result != 1){
         let updateTempToken = this.state.tempToken;
         updateTempToken.pontos.push({x: this.state.svgMousePosX, y: this.state.svgMousePosY});
         this.setState({tempToken: updateTempToken});
      }
      else{//last click
         //atualizar o lastToolSelected pro "Enter" ?!
         let toolSelected = "noneTool";
         let tool = ToolHelper.initTool(toolSelected, this.getShapeOptions());
         let updateTempToken = this.state.tempToken;
         let arrayObjects = this.state.svgPaths;

         this.saveHistory();
         if(this.state.currentTool === "arcTool"){
            let lastArcPoint = TokenHelper.buildLastArcPoint(updateTempToken, {x: this.state.svgMousePosX, y: this.state.svgMousePosY});//Essa linha eh diferente pra rect e poly
            updateTempToken.pontos.push(lastArcPoint);
            arrayObjects[this.state.currentPathSelected].tokenList.push(updateTempToken);
         }
         else if(this.state.currentTool === "bezierTool"){
            updateTempToken.pontos.push({x: this.state.svgMousePosX, y: this.state.svgMousePosY});
            //converter a ordem dos pontos pro render "funcionar"
            //a b 1 2 c 3 4 d 5 6
            //        | ___x___
            //a b 1 2 c 3 4 d 5 6
            //   / /   / /   / /
            //a 1 2 b 3 4 c 5 6 d
            let b = updateTempToken.pontos[1];
            let c1 = updateTempToken.pontos[2];
            let c2 = updateTempToken.pontos[3];
            updateTempToken.pontos[1] = c1;
            updateTempToken.pontos[2] = c2;
            updateTempToken.pontos[3] = b;
            arrayObjects[this.state.currentPathSelected].tokenList.push(updateTempToken);
         }
         else{//line circle circleE rect polyc
            updateTempToken.pontos.push({x: this.state.svgMousePosX, y: this.state.svgMousePosY});
            arrayObjects[this.state.currentPathSelected].tokenList.push(updateTempToken);
         }
         this.setState({currentTool: tool.toolSelected, commandExecution: tool.command, tempToken: null, svgPaths: arrayObjects}, ()=> this.toolsDicRef[toolSelected].current.checked = true);

      }
      
   }
   
   //Pan control and move token control
   viewPanControlAndMoveToken=(event)=>{
      event.stopPropagation();
      //token move tool
      if(event.button === 0){
         if(this.state.currentTool != "moveTool")return;
         let startingSvgPosX = this.state.svgMousePosX;
         let startingSvgPosY = this.state.svgMousePosY;

         //console.log(mouseStartX, mouseStartY);
         //console.log(this.state.svgMousePosX, this.state.svgMousePosY);
         const indexPath = this.state.currentPathSelected;
         let allPaths = this.state.svgPaths;
         this.saveHistory();
         let pathSelected = allPaths[indexPath];
         let tokenList = pathSelected.tokenList;

         let pointSelected = {tokenIndex: -1, pointIndex: -1, type: "none"};
         let tokenBefore = null;
         let hitted = false;
         loopMove1:
         for(let i = 0; i < tokenList.length; i++){
            let token = tokenList[i];
            for(let k = 0; k < token.pontos.length; k++){//vai depender to tipo de token, se for line eh por ponto, circulo ja eh diferented, e aarc
               let dx_stageUnits = Math.abs(this.state.svgMousePosX - token.pontos[k].x);//preciso converter essa distancia em pixels ao inves de stageUnits...how ?1
               let dy_stageUnits = Math.abs(this.state.svgMousePosY - token.pontos[k].y);
               let dx_pixelUnits = dx_stageUnits * this.state.scale;
               let dy_pixelUnits = dy_stageUnits * this.state.scale;
               let distanceSquared = dx_pixelUnits * dx_pixelUnits + dy_pixelUnits * dy_pixelUnits;
               if(distanceSquared < 36){//6 pixels distance
                  pointSelected.tokenIndex = i;
                  pointSelected.pointIndex = k;
                  pointSelected.type = token.type;//nao sei se eh necessario ainda
                  tokenBefore = JSON.parse(JSON.stringify(token));//preciso de uma deep copy
                  hitted = true;
                  let movePointIdentifier = {tokenIndex: i, pointIndex: k};
                  this.setState({movePointIdentifier: movePointIdentifier});
                  //aqui eu preciso salvar de alguma forma o token ID pra no snap nao colidir com ele mesmo..how ?!
                  break loopMove1;
                  
               }
               
            }
         }

         const moveTokenPoint = (event) => {
            if (hitted === true){
               if(event.shiftKey === true){//event.ctrlKey //move o token inteiro
                  let svgDeltaX = this.state.svgMousePosX - startingSvgPosX;
                  let svgDeltaY = this.state.svgMousePosY - startingSvgPosY;
                  for(let k = 0; k < tokenList[pointSelected.tokenIndex].pontos.length; k++){
                     tokenList[pointSelected.tokenIndex].pontos[k].x = tokenBefore.pontos[k].x + svgDeltaX;
                     tokenList[pointSelected.tokenIndex].pontos[k].y = tokenBefore.pontos[k].y + svgDeltaY;

                  }   
               }
               else{
                  //vai depender do token e do index...se for o primeiro ponto...anda com tudo...tipo circulo e tal
                  //if(pointSelected.type === "circle"){//arc //circleEdge
                  //se for arc tem q recalcular os pontos...
                  tokenList[pointSelected.tokenIndex].pontos[pointSelected.pointIndex].x = this.state.svgMousePosX;
                  tokenList[pointSelected.tokenIndex].pontos[pointSelected.pointIndex].y = this.state.svgMousePosY;
               }
               
               pathSelected.tokenList = tokenList;

               this.setState({svgPaths: allPaths});
            } 
               
         }
         const moveTokenPointEnd = (event) => {
            
            let movePointIdentifier = {tokenIndex: -1, pointIndex: -1};
            this.setState({movePointIdentifier: movePointIdentifier});

            document.removeEventListener('mousemove', moveTokenPoint);
            document.removeEventListener('mouseup', moveTokenPointEnd);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }

         document.addEventListener('mousemove', moveTokenPoint);
         document.addEventListener('mouseup', moveTokenPointEnd);
         return;

      }
      else if(event.button === 2){//butao da direita do mouse
         //posso abrir um menu meu com opcoes sei la...o lance do fixed->
         //se tiver uma tool selecionada...se for line e tal...termina ela? ou cancela o command ?
         return;
      }
      //parte do pan
      else if(event.button === 1){//0 esquerda | 1 eh wheel | 2 direita
         let mouseStartX = event.clientX; //converter para local coord
         let mouseStartY = event.clientY; //converter para local coord
         let startingPosX = this.state.offsetDisplayX;
         let startingPosY = this.state.offsetDisplayY;

         const mouseMovePan = (event) => {
               let deltaMouseX = event.clientX - mouseStartX;
               let deltaMouseY = event.clientY - mouseStartY;
               let deltaX = startingPosX + deltaMouseX;
               let deltaY = startingPosY + deltaMouseY;
               this.setState({offsetDisplayX: deltaX, offsetDisplayY: deltaY});
               
         }
         const endMovePan = (event) => {
            document.removeEventListener('mousemove', mouseMovePan);
            document.removeEventListener('mouseup', endMovePan);
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }

         document.addEventListener('mousemove', mouseMovePan);
         document.addEventListener('mouseup', endMovePan);
      }

   }
   
   //Mouse move -> calc pos no svg stage e os snaps
   calcMouseSVGCanvasPosAndSnap=(event)=>{
      let startPosX = event.clientX;
      let startPosY = event.clientY;
      let stageRect = this.canvasRef.current.getBoundingClientRect();
      let stageMousePosX = event.clientX - stageRect.x;
      let stageMousePosY = event.clientY - stageRect.y;
      let displaySizeX = this.state.viewBoxWidth * this.state.scale;
      let displaySizeY = this.state.viewBoxHeight * this.state.scale;
      let displayOffsetX = ((this.props.drawAreaSize - displaySizeX) * 0.5) + this.state.offsetDisplayX;
      let displayOffsetY = ((this.props.drawAreaSize - displaySizeY) * 0.5) + this.state.offsetDisplayY;
      
      let ax = stageMousePosX - displayOffsetX;
      let ay = stageMousePosY - displayOffsetY;
      let stagePosNormX = ax / displaySizeX;
      let stagePosNormY = ay / displaySizeY;
      let svgMousePosX = window.RoundNumber(stagePosNormX * (this.state.viewBoxWidth), 2);
      let svgMousePosY = window.RoundNumber(stagePosNormY * (this.state.viewBoxHeight), 2);
      
      
      const snapPixelDistanceSquared = 36;
      const calcDistSquared = (p, posX, posY) => {
         //preciso converter essa distancia em pixels ao inves de stageUnits...
         let dx_stageUnits = Math.abs(posX - p.x);
         let dy_stageUnits = Math.abs(posY - p.y);
         let dx_pixelUnits = dx_stageUnits * this.state.scale;
         let dy_pixelUnits = dy_stageUnits * this.state.scale;
         let distanceSquared = dx_pixelUnits * dx_pixelUnits + dy_pixelUnits * dy_pixelUnits;
         return distanceSquared;
      }  

      //anchor points - centro de circulo, pontos de arc e centro de arc, pontos de bezier curve

      let hasHighlight = false;
      let hightLightIndex = -1;
      let hittedObj = false;
      if(this.state.snap){
         for(let i = 0; i < this.anchorPoints.length; i++){
            let obj = this.anchorPoints[i];
            if(this.state.currentTool === "moveTool"){
               if(obj.id.pathID === this.state.currentPathSelected){//se for igual ao path selected
                  if(obj.id.tokenIndex === this.state.movePointIdentifier.tokenIndex){//se for igual ao token selected (move)
                     if(obj.id.pIndex === this.state.movePointIdentifier.pointIndex){//se for igual ao ponto seleteced...skip check
                        continue;
                     }
                  }
               }
            }
   
            if(this.state.snapToEndPoints){
               if(obj.id.type === "end" || obj.id.type === "b_control1" || obj.id.type === "b_control2"){
                  if(calcDistSquared(obj.pt, svgMousePosX, svgMousePosY) < snapPixelDistanceSquared){
                     svgMousePosX = obj.pt.x;
                     svgMousePosY = obj.pt.y;
                     if(this.state.currentTool === "moveTool" || this.state.currentTool === "noneTool"){
                        if(obj.id.pathID === this.state.currentPathSelected){
                           hightLightIndex = obj.id.tokenIndex;
                        }
                     }
                     
                     hittedObj = true;
                     break;
                  }
               }
            }
            if(this.state.snapToMidPoints && obj.id.type === "mid"){
               if(calcDistSquared(obj.pt, svgMousePosX, svgMousePosY) < snapPixelDistanceSquared){
                  svgMousePosX = obj.pt.x;
                  svgMousePosY = obj.pt.y;
                  hittedObj = true;
                  break;
               }
            }
         }

         if(this.state.snapToIntersection){
            //intersection points (line x line | circle x line | circle x circle)
            for(let i = 0; i < this.collisionPoints.length; i++){
               if(calcDistSquared(this.collisionPoints[i].p, svgMousePosX, svgMousePosY) < snapPixelDistanceSquared){
                  svgMousePosX = this.collisionPoints[i].p.x;
                  svgMousePosY = this.collisionPoints[i].p.y;
                  hittedObj = true;
                  break;
               }
            }
         }
         
         if(!hittedObj){
            if(this.state.snapToGrid){
               let snapResultX = Math.round(svgMousePosX / this.state.snapGridStep) * this.state.snapGridStep;
               let snapResultY = Math.round(svgMousePosY / this.state.snapGridStep) * this.state.snapGridStep;
               svgMousePosX = snapResultX;
               svgMousePosY = snapResultY;
            }
         }
         
         
         
         if(this.state.snapToAngle){
            if(this.state.currentTool === "lineTool"){
               if(this.state.tempToken.pontos.length === 1){
                  const finalCoord = this.angleSnapCalculation(0, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
               else if(this.state.tempToken.pontos.length > 1){
                  let indexBefore = this.state.tempToken.pontos.length - 1;
                  const finalCoord = this.angleSnapCalculation(indexBefore, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
            }
   
            else if(this.state.currentTool === "arcTool"){
               if(this.state.tempToken.pontos.length === 1){
                  const finalCoord = this.angleSnapCalculation(0, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
               else if(this.state.tempToken.pontos.length === 2){
                  const finalCoord = this.angleSnapCalculation(0, 1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
            }
   
            else if(this.state.currentTool === "bezierTool"){
               if(this.state.tempToken.pontos.length === 1 || this.state.tempToken.pontos.length === 2){
                  const finalCoord = this.angleSnapCalculation(0, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
               else if(this.state.tempToken.pontos.length === 3){
                  const finalCoord = this.angleSnapCalculation(1, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
                  
               }
            }
            
            else if(this.state.currentTool === "circleTool" || this.state.currentTool === "circleEdgeTool"){
               if(this.state.tempToken.pontos.length === 1){
                  const finalCoord = this.angleSnapCalculation(0, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
            }
   
            else if(this.state.currentTool === "rectTool" || this.state.currentTool === "polygonTool"){
               if(this.state.tempToken.pontos.length === 1){
                  const finalCoord = this.angleSnapCalculation(0, -1, svgMousePosX, svgMousePosY);
                  svgMousePosX = finalCoord.x, svgMousePosY = finalCoord.y;
               }
            }
         }


      }
      
      let newMouseInfo = this.state.mouseInfo;
      newMouseInfo.mouseX = stageMousePosX;
      newMouseInfo.ax = ax;
      newMouseInfo.mouseY = stageMousePosY;
      newMouseInfo.ay = ay;
      
      this.setState({svgMousePosX: svgMousePosX, svgMousePosY: svgMousePosY, highLightTokenIndex: hightLightIndex, mouseInfo: newMouseInfo});
      
   }

   angleSnapCalculation=(indexA, indexB, posX, posY)=>{
      let pontoA = this.state.tempToken.pontos[indexA];
      let pontoC = {x: posX, y: posY}
      let vec2 = new Vector2D(pontoA, pontoC);
      let dist = vec2.getLenght();
      if(Math.abs(dist) < 0.0001){//guard contra NaN
         return {x: posX, y: posY};
      }
      let pontoB = (indexB === -1) ?  {x:  this.state.tempToken.pontos[indexA].x + dist, y:  this.state.tempToken.pontos[indexA].y} : this.state.tempToken.pontos[indexB];
      let vec1 = new Vector2D(pontoA, pontoB);
      
      let cosTheta = dotProduct(vec1, vec2) / (vec1.getLenght() * vec2.getLenght());
      let angleRad = Math.acos(cosTheta);
      let angle = window.utils.RadToDeg(angleRad); //works //0 a 180, quero de 0 a 360...
      
      let finalAngle = Math.round(angle / this.state.snapAngleStep) * this.state.snapAngleStep;
      let finalAngleRad = window.utils.DegToRad(finalAngle); 

      let normalVec = new Vector2D(pontoA, {x:pontoA.x + vec1.ln.x , y: pontoA.y + vec1.ln.y});
      let dotNormals = dotProduct(normalVec, vec2);
      finalAngleRad = (dotNormals > 0 ? -finalAngleRad : finalAngleRad);

      let cos = Math.cos(finalAngleRad);
      let sin = Math.sin(finalAngleRad);
      let vX = pontoB.x - pontoA.x;
      let vY = pontoB.y - pontoA.y;
      let finalPointX = vX * cos - vY * sin;
      let finalPointY = vX * sin + vY * cos;

      //usar Math.Atan2 pode ser que simplifique isso

      return {x: finalPointX + pontoA.x, y: finalPointY + pontoA.y};

   }
   

   buildCollisionPoints=(lines, circles, collisionPoints)=>{
      //so faco isso se tiver o snap de intersection
      //lines x lines && lines x circles
      for(let i = 0; i < lines.length; i++){
         //teste linha x linha
         if(i < lines.length - 1){
            for(let k = i + 1; k < lines.length; k++){
               if(lines[i].pathID != lines[k].pathID){//tao em layers separados
                  continue;
               }
               
               //teste com as outras linhas
               let ax = lines[i].vec.p1.x;//x1
               let ay = lines[i].vec.p1.y;//y1
               let bx = lines[i].vec.p2.x;//x2
               let by = lines[i].vec.p2.y;//y2
               
               let cx = lines[k].vec.p1.x;//x3
               let cy = lines[k].vec.p1.y;//y3
               let dx = lines[k].vec.p2.x;//x4
               let dy = lines[k].vec.p2.y;//y4
               
               let top = (dx-cx)*(ay-cy)-(dy-cy)*(ax-cx);//Kross(qpVec, sVec)
               let bot = (dy-cy)*(bx-ax)-(dx-cx)*(by-ay);//Kross(rVec, sVec)
               if(bot != 0){//se bot === 0 -> tao uma em cima da outra
                  let t = top / bot;//o que resulta no t = NaN
                  let u = ((bx - ax)*(ay-cy)-(by-ay)*(ax-cx)) / bot;// ((ax + (bx-ax)*t) - cx) / (dx-cx);
                  if(t > 0 && t < 1){
                     if((u > 0 && u < 1)){//mas eu preciso que esteja dentro da outra linha tb...do u
                        let posX = ax + (bx-ax)*t;
                        let posY = ay + (by-ay)*t;
                        collisionPoints.push({p:{x: posX, y:posY}, pathID: lines[i].pathID});
                     }
                  }
               }
            }
         }
         //teste linha x circulo
         for(let cNum = 0; cNum < circles.length; cNum++){
            if(lines[i].pathID != circles[cNum].pathID){//tao em layers separados
               continue;
            }
            
            let cx = circles[cNum].vec.p1.x;
            let cy = circles[cNum].vec.p1.y;
            let r = circles[cNum].vec.getLenght();
            
            let pontoP = lines[i].vec.p1;//first point da linha
            let segVec = lines[i].vec;
            let d = segVec.getDirection();
            let m = new Vector2D({x:cx, y:cy}, {x:pontoP.x, y:pontoP.y});
            
            let b = dotProduct(m, d);
            let c = dotProduct(m, m) - (r*r);
            let discriminant = (b * b) - c;
            
            if(discriminant < 0) {
               //nao acertou o circulo
               continue;
            }
            else if(discriminant === 0) {
               //acertou o circulo tangencialmente - 1 ponto so
               //console.log("tangente :)")
               //nao sei se boto o ponto....
               continue;
            }
            else{
               //possivelmente acertou o circulo em 2 lugares //pode ter falso positivo por conta do tamanho do segmento
               let t1 = -b - Math.sqrt(discriminant);
               let t2 = -b + Math.sqrt(discriminant);
               if(t1 > 0 && t1 < segVec.getLenght()){//se for menor que 0, nao acertou
                  let posX = pontoP.x + d.dx * t1;
                  let posY = pontoP.y + d.dy * t1;
                  collisionPoints.push({p:{x: posX, y:posY}, pathID: lines[i].pathID});
               }

               if(t2 > 0 && t2 < segVec.getLenght()){//se for menor que 0, nao acertou
                  let posX = pontoP.x + d.dx * t2;
                  let posY = pontoP.y + d.dy * t2;
                  collisionPoints.push({p:{x: posX, y:posY}, pathID: lines[i].pathID});
               }
            }
         }
      }
      
      //teste circle x circle
      for(let i = 0; i < circles.length; i++){
         if(i < circles.length - 1){
            for(let k = i + 1; k < circles.length; k++){
               if(circles[i].pathID != circles[k].pathID){//tao em layers separados
                  continue;
               }

               let p0 = circles[i].vec.p1;//centro do circulo 1
               let p1 = circles[k].vec.p1;//centro do circulo 2
               let r0 = circles[i].vec.getLenght();//raio do circulo 1
               let r1 = circles[k].vec.getLenght();//raio do circulo 2
               let d = new Vector2D(p0, p1).getLenght();

               //checks no d...
               //overlap 100%, um dentro do outro, longe sem contato, encostados por 1 ponto ou 2 pontos de contato
               if (d > r0+r1){
                  //return None # no solutions, the circles are separate
                  continue;
               }
               if (d < Math.abs(r0-r1)){
                  //return None # no solutions because one circle is contained within the other
                  continue;
               }
               if (d === 0 && r0 === r1){
                  //return None # circles are coincident and there are an infinite number of solutions
                  continue;
               }

               let a = ((r0*r0) - (r1*r1) + (d*d)) / (2*d);
               let h = Math.sqrt((r0*r0) - (a * a));//isso que mata
               
               let p2x = p0.x + a * (p1.x - p0.x) / d;
               let p2y = p0.y + a * (p1.y - p0.y) / d;
               
               let posX1 = p2x + (h * ((p1.y - p0.y) / d));
               let posY1 = p2y - (h * ((p1.x - p0.x) / d));

               let posX2 = p2x - h * (p1.y - p0.y) / d;
               let posY2 = p2y + h * (p1.x - p0.x) / d;
               
               collisionPoints.push({p:{x: posX1, y:posY1}, pathID: circles[i].pathID});
               collisionPoints.push({p:{x: posX2, y:posY2}, pathID: circles[i].pathID});
            
            }
         }
      }

   }
   
   buildSnapPointsDraw=()=>{
      let strokePixel = 1.2;
      let anchorRadius = 3.2 / this.state.scale;//esse tem q ser assim mesmo
      let myConfig = {
         strokePixel: strokePixel,
         anchorRadius: anchorRadius,
         svgMousePosX: this.state.svgMousePosX,
         svgMousePosY: this.state.svgMousePosY,
         scale: this.state.scale,
      }
      let snapDrawPoints = <></>;

      let pontosDraw = [];
      const cos30 = Math.cos(window.utils.DegToRad(-30));
      const sin30 = Math.sin(window.utils.DegToRad(-30));
      const r_triangle = 6 / this.state.scale;
      const xDis30 = cos30 * r_triangle;
      const yDis30 = sin30 * r_triangle;
      for(let i = 0; i < this.anchorPoints.length; i++){
         const cx = this.anchorPoints[i].pt.x;
         const cy = this.anchorPoints[i].pt.y;

         let endColor = "white";
         let midColor = "#e1e100";//mid points e bezier controls
         let controlColor = "yellow";
         if(this.anchorPoints[i].id.pathID != this.state.currentPathSelected){
            midColor = "grey";
            endColor = "grey";
            controlColor = "grey";
         }
         
         if(this.anchorPoints[i].id.type === "end"){
            if(this.anchorPoints[i].id.pIndex === 0 && endColor != "grey"){
               endColor = "cyan";
            }
            if(this.anchorPoints[i].id.pIndex === 1 && endColor != "grey"){
               endColor = "orange";
            }
            if(this.state.currentTool === "moveTool" || this.state.snapToEndPoints){
               let snapPoint = <circle cx={cx} cy={cy} r={myConfig.anchorRadius*1.3} fill={endColor} stroke="black" strokeWidth={1.4} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               pontosDraw.push(snapPoint);
            }
            
         }
         else if(this.anchorPoints[i].id.type === "mid"){
            if(this.state.snapToMidPoints){
               const p1x = cx - xDis30, p1y = cy - yDis30;
               const p2x = cx + xDis30, p2y = cy - yDis30;
               const p3x = cx , p3y = cy - r_triangle;
               const poly = <polygon points={`${p1x} ${p1y} ${p2x} ${p2y} ${p3x} ${p3y}`}
                  fill={midColor} stroke="black" strokeWidth={1.5} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               pontosDraw.push(poly);
            }
         }

         else if(this.anchorPoints[i].id.type === "b_control1"){
            // if(this.anchorPoints[i].id.pIndex === 0 && endColor != "grey"){
            //    endColor = "cyan";
            // }
            if(this.state.currentTool === "moveTool" || this.state.snapToEndPoints){
               let quad1 = <rect x={cx - anchorRadius} y={cy - anchorRadius}
                  width={anchorRadius * 2} height={anchorRadius * 2}
                  fill={controlColor} stroke="black"
                  strokeWidth={1} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
               />
               let quad2 = <rect x={this.anchorPoints[i+1].pt.x - anchorRadius} y={this.anchorPoints[i+1].pt.y - anchorRadius}
                  width={anchorRadius * 2} height={anchorRadius * 2}
                  fill={controlColor} stroke="black"
                  strokeWidth={1} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
               />
               let newLine1 = <line x1={this.anchorPoints[i-1].pt.x} y1={this.anchorPoints[i-1].pt.y} x2={this.anchorPoints[i].pt.x} y2={this.anchorPoints[i].pt.y} stroke="orange" strokeWidth={1}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               let newLine2 = <line x1={this.anchorPoints[i+1].pt.x} y1={this.anchorPoints[i+1].pt.y} x2={this.anchorPoints[i+2].pt.x} y2={this.anchorPoints[i+2].pt.y} stroke="orange" strokeWidth={1}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               pontosDraw.push(quad1);
               pontosDraw.push(quad2);
               pontosDraw.push(newLine1);
               pontosDraw.push(newLine2);
            }
            
         }

         
      }
      
      if(this.state.snapToIntersection){
         for(let i = 0; i < this.collisionPoints.length; i++){
            let intersectColor = "#ff3333";
            if(this.collisionPoints[i].pathID != this.state.currentPathSelected){
               intersectColor = "grey";
            }
            let snapPoint = <circle cx={this.collisionPoints[i].p.x} cy={this.collisionPoints[i].p.y} r={myConfig.anchorRadius*1.1} 
               fill={intersectColor} stroke="black" strokeWidth={1.5} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
            pontosDraw.push(snapPoint);
         }
      }
      
      snapDrawPoints = <>{pontosDraw}</>
      return snapDrawPoints;
      
   }

   

   // #region Extra helpers , resetStagePos, zoom save e tal
   resetStagePos=(e)=>{
      this.setState({offsetDisplayX: 0, offsetDisplayY: 0})
   }
   resetZoom=(e)=>{
      this.setState({scale: 1})
   }
   zoomArea=(e)=>{
      let oldScale = this.state.scale;
      let zoomModifier = 32;//multiplos do 512 ;)
      let chosenSide = this.state.viewBoxWidth;
      if(this.state.viewBoxHeight > this.state.viewBoxWidth){
         chosenSide = this.state.viewBoxHeight;
      }
      let oldSize = chosenSide * (oldScale);
      //overShoot < 0 // ta usando a full tela
      let overShoot = this.props.drawAreaSize - oldSize;
      if(overShoot < 0){//ta na tela toda
         zoomModifier = 64;//anda de 50 em 50 pixels
         if(overShoot < -1088){//ou 1120
            zoomModifier = 128;//anda de 100 em 100 pixels
            if(overShoot < -1792){//ou ~1800
               zoomModifier = 256;//anda de 200 em 200 pixels
               if(overShoot < -3328){//ou ~3400
                  zoomModifier = 512;
                  if(overShoot < -8192){
                     zoomModifier = 1024;
                  }
               }
            }
         }
      }
      
      let newDrawsize = 20;//ainda ta errado
      if(e.deltaY > 0) {
         //zoom out -> diminui o tamanho do desenho
         let a = oldSize - zoomModifier;
         let finalScale = a / chosenSide;
         let newDrawsizeX = this.state.viewBoxWidth * (finalScale);
         let newDrawsizeY = this.state.viewBoxHeight * (finalScale);
         if(newDrawsize < 8 === false){//menor tamanho que um drawing pode ter

            let b_stagePosNormX = this.state.svgMousePosX / this.state.viewBoxWidth;
            let b_ax = b_stagePosNormX * newDrawsizeX;
            let b_displayOffsetX = this.state.mouseInfo.mouseX - b_ax;
            let b_offsetDisplayX = b_displayOffsetX - ((this.props.drawAreaSize - newDrawsizeX) * 0.5);

            let b_stagePosNormY = this.state.svgMousePosY / this.state.viewBoxHeight;
            let b_ay = b_stagePosNormY * newDrawsizeY;
            let b_displayOffsetY = this.state.mouseInfo.mouseY - b_ay;
            let b_offsetDisplayY = b_displayOffsetY - ((this.props.drawAreaSize - newDrawsizeY) * 0.5);

            //this.setState({scale: finalScale}); //sem o zoom com focus
            this.setState({scale: finalScale, offsetDisplayX: b_offsetDisplayX, offsetDisplayY: b_offsetDisplayY});
         }
      }
      else{
         //zoom in -> aumenta o tamanho do desenho
         let a = oldSize + zoomModifier;
         let finalScale = a / chosenSide;
         let newDrawsizeX = this.state.viewBoxWidth * (finalScale);
         let newDrawsizeY = this.state.viewBoxHeight * (finalScale);
         //let cellUnitSize = newDrawsize / this.state.viewBoxSize;
         let cellUnitSize = 1;
         //limito o size pra que o zoom seja no maximo 3 units = 512
         if(cellUnitSize < (this.props.drawAreaSize / 3)){//max size of zoom sao 3 grid cells
            
            //Indo -- caminho de ida
            //     let stageMousePosX = event.clientX - stageRect.x; //trago essa info via state
            // D - let displaySize = this.state.viewBoxSize * this.state.scale;
            // C - let displayOffsetX = ((this.props.drawAreaSize - displaySize) * 0.5) + this.state.offsetDisplayX;
            //                                                                            |______what i want______|
            // B - let ax = stageMousePosX - displayOffsetX;
            // A - let stagePosNormX = ax / displaySize;
            //     let svgMousePosX = window.RoundNumber(stagePosNormX * (this.state.viewBoxSize), 2);
            
            //faz o caminho inverso de achar a posicao do svg, e isola o this.state.offsetDisplayX
            let b_stagePosNormX = this.state.svgMousePosX / this.state.viewBoxWidth;
            let b_ax = b_stagePosNormX * newDrawsizeX;
            let b_displayOffsetX = this.state.mouseInfo.mouseX - b_ax;
            let b_offsetDisplayX = b_displayOffsetX - ((this.props.drawAreaSize - newDrawsizeX) * 0.5);

            let b_stagePosNormY = this.state.svgMousePosY / this.state.viewBoxHeight;
            let b_ay = b_stagePosNormY * newDrawsizeY;
            let b_displayOffsetY = this.state.mouseInfo.mouseY - b_ay;
            let b_offsetDisplayY = b_displayOffsetY - ((this.props.drawAreaSize - newDrawsizeY) * 0.5);
            
            //this.setState({scale: finalScale}); //sem o zoom com focus
            this.setState({scale: finalScale, offsetDisplayX: b_offsetDisplayX, offsetDisplayY: b_offsetDisplayY});
            
         }
      }
      
   }

   zoomToFill=()=>{
      let zoomModifier = 32;// 51.2
      let finalSize = this.props.drawAreaSize - zoomModifier;
      let biggerSize = this.state.viewBoxWidth;
      if(this.state.viewBoxHeight >  this.state.viewBoxWidth){
         biggerSize = this.state.viewBoxHeight;
      }
      let finalScale = finalSize / biggerSize;
      this.setState({scale: finalScale, offsetDisplayX: 0, offsetDisplayY: 0});
   }
   saveView=(e)=>{
      let newView = { x: this.state.offsetDisplayX, y: this.state.offsetDisplayY, z: this.state.scale };
      this.setState({savedView: newView});
   }
   loadView=(e)=>{
      let view = this.state.savedView;
      this.setState({offsetDisplayX: view.x, offsetDisplayY: view.y, scale: view.z});
   }
   showGrid=(e)=>{
      let showGrid = !this.state.showGrid;
      this.setState({showGrid: showGrid});
   }
   
   focusArea=(e)=>{
      this.canvasRef.current.focus();
   }
   unfocusArea=(e)=>{
      this.canvasRef.current.blur();
   }
   // #endregion
   
   //drag dos layers pra rearranjar
   dragListDown=(e)=>{
      if(e.target.dataset.info != "movable") return;
      //e.stopPropogation();
      if(e.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         //const listenerObj = e.currentTarget;
         const mouseStartX = e.clientX;
         const mouseStartY = e.clientY;
         const startTime = Date.now();
         
         const rectArea = this.dragListRef.current.getBoundingClientRect();
         const listStartY = mouseStartY - rectArea.y;
         
         //da uns erros assim, fazer com o currentSelected e calcular pra onde vai...
         //const positionalIndex = Math.floor((listStartY - 1) / 26);//nao pode index -1 nem maior do que a lista//limitar isso depois
         let clickIndex = Math.floor((listStartY) / 26);
         const startIndex = this.state.currentPathSelected;
         let moving = false;
         const listDragMove = (e) => {

            //const deltaTime = Date.now() - startTime;
            let traslateArray = [];
            this.state.svgPaths.map((item) => traslateArray.push(0));

            let deltaY = e.clientY - mouseStartY;
            let abs = Math.abs(deltaY);
            let numIndexes = Math.ceil((abs - 13) / 26);//13 eh half height do elemento, 26 eh height do elemento
            if(deltaY < 0){//levando o item pra cima
               for(let i = 0; i < numIndexes; i++){
                  let indexToChange = this.state.currentPathSelected - 1 - i;
                  if(indexToChange >= 0){
                     traslateArray[indexToChange] = 26;
                  }
               }
            }
            else if(deltaY > 0){//levando o item pra baixo
               for(let i = 0; i < numIndexes; i++){
                  let indexToChange = this.state.currentPathSelected + 1 + i;
                  if(indexToChange < traslateArray.length){
                     traslateArray[indexToChange] = -26;
                  }
               }
            }
            traslateArray[this.state.currentPathSelected] = deltaY;
            this.setState({translateArrayY: traslateArray, isPerformingDrag: true});
            
         }
         const endListDrag = (e) => {
            
            const deltaTime = Date.now() - startTime;
            if(deltaTime > 150){
               //calculo do index novo
               let pos = this.state.translateArrayY[this.state.currentPathSelected];
               let deltaIndex = Math.floor((pos + 13) / 26);
               let finalIndex = this.state.currentPathSelected + deltaIndex;
               finalIndex = window.ClampNumber(finalIndex, 0, this.state.translateArrayY.length - 1);//utils
               
               //ver se dropou em lugar certinho  //ou se volta tudo pra como comecou
               //reorder a array
               let reorderedArray = [...this.state.svgPaths];
               // Array.prototype.move = function (from, to) {
               //     this.splice(to, 0, this.splice(from, 1)[0]);
               // };
               reorderedArray.splice(finalIndex, 0, reorderedArray.splice(this.state.currentPathSelected, 1)[0]);//magic :)

               let arr = [];
               this.state.svgPaths.map((item)=> arr.push(0));
               this.setState({svgPaths: reorderedArray, currentPathSelected: finalIndex, translateArrayY: arr, isPerformingDrag:false});
            }
            else{
               //drag muito curto, nao altera nada
               let arr = [];
               this.state.svgPaths.map((item)=> arr.push(0));
               this.setState({translateArrayY: arr, isPerformingDrag:false});
               
            }
            
            
            document.removeEventListener('mousemove', listDragMove);//aqui eh document pq ele pode arrastar o mouse pra fora da lista
            document.removeEventListener('mouseup', endListDrag);//aqui eh document pq ele pode arrastar o mouse pra fora da lista
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }
   
         document.addEventListener('mousemove', listDragMove);
         document.addEventListener('mouseup', endListDrag);
      }


   }
   
   

  
}

export default SvgDrawingApp;



