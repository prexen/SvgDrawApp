import {Vector2D, dotProduct} from '../Utils/Lib2D.jsx';
import {DegToRad} from '../Utils/Utils_Window';

export const ToolHelper = {
   initTool(toolName, shapeOptions){
      let toolSelected = toolName;
      let command = this.tools[toolName].commandValue;
      command.reset();
      let tempToken = TokenHelper.createTokenTemplate(this.tools[toolName].tokenType, shapeOptions);
      let o = {
         toolSelected: toolSelected,
         command: command,
         token: tempToken,
      }
      return o;
      
   },
   tools: {//bota como CreationTools e depois faz um editTools ?
      "noneTool" :{
         tokenType: "none",
         commandValue: {
            reset(){
              
            },
            update(){
               return 1;
            }
         },
         DrawingFunction(token, config){return <></>}
      },
      "moveTool" :{
         tokenType: "none",
         commandValue: {
            reset(){
              
            },
            update(){
               return 1;
            }
         },
         DrawingFunction(token, config){return <></>}
      },
      
      "lineTool": {
         tokenType: "line",
         commandValue: {
            currentClick: 0,
            totalClicks: Number.MAX_SAFE_INTEGER,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks){
                  return 1;
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw =<></>;
            let tempPath = TokenHelper.convertTokenToPath(token);
            let drawPoints = [];
            if(token.pontos.length > 0){
               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
                  drawPoints.push(dot)
               }
            }
            
               let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
                  drawPoints.push(dot)
            
            let drawLines = [];
            if(token.pontos.length > 0){
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }
            
            resultDraw =<>
                  <path drawing="TempDisplay" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} stroke="orange" strokeLinecap="round" strokeLinejoin="round"
                     d={tempPath} key={crypto.randomUUID()}/>
                  {drawLines}
                  {drawPoints}
               </>
            return resultDraw;
         }
      },
      "circleTool": {
         tokenType: "circle",
         commandValue: {
            currentClick: 0,
            totalClicks: 2,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw = <></>;
            let tempPath = TokenHelper.convertTokenToPath(token);
            let drawPoints = [];
            let drawLines = [];

            //mouse pos
            let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawPoints.push(dot);
            
            if(token.pontos.length > 0){
               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                     strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                     />
                  drawPoints.push(dot)
               }
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
               
            }
            
            let circleElement = <></>
            let infoText = <></>
            if(token.pontos.length > 0){
               //calculo do raio do circle
               let dx = config.svgMousePosX - token.pontos[0].x;
               let dy = config.svgMousePosY - token.pontos[0].y;
               let raio = Math.sqrt(dx * dx + dy*dy);
               let centroX = token.pontos[0].x;
               let centroY = token.pontos[0].y;
               circleElement = <circle cx={centroX} cy={centroY} r={raio}  stroke="orange"
               strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"}
               />
               infoText = <text x={centroX} y={centroY + (20 / config.scale)} stroke="orange" strokeWidth={.1}
                  vectorEffect={"non-scaling-stroke"} fill="orange" fontSize={`${12 / config.scale}px`} key={crypto.randomUUID()}>
                     {`r ${window.utils.RoundNumber(raio, 1)}`}
                  </text>
               
            }
            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="white" strokeLinecap="round" strokeLinejoin="round" d={tempPath} key={crypto.randomUUID()}/>
               {drawLines}
               {drawPoints}
               {circleElement}
               {infoText}
            </>
            return resultDraw;
         }
      },

      "circleEdgeTool": {
         tokenType: "circle e",
         commandValue: {
            currentClick: 0,
            totalClicks: 2,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw =<></>;
            let tempPath = TokenHelper.convertTokenToPath(token);
            let drawPoints = [];
            if(token.pontos.length > 0){
               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                     strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                     />
                  drawPoints.push(dot)
               }
            }
            else{
               let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
               />
               drawPoints.push(dot)
            }

            let drawLines = [];
            if(token.pontos.length > 0){
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }
            
            let circleElement = <></>
            let infoText = <></>
            if(token.pontos.length > 0){
               //calculo do raio do circle
               let dx = config.svgMousePosX - token.pontos[0].x;
               let dy = config.svgMousePosY - token.pontos[0].y;
               let raio = Math.sqrt(dx * dx + dy*dy) * 0.5;
               let centroX = token.pontos[0].x + dx * 0.5;
               let centroY = token.pontos[0].y + dy * 0.5;
               circleElement = <circle cx={centroX} cy={centroY} r={raio}  stroke="orange"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                  />
               infoText = <text x={centroX} y={centroY +  + (20 / config.scale)} stroke="orange" strokeWidth={.1}
                  vectorEffect={"non-scaling-stroke"} fill="orange" fontSize={`${12 / config.scale}px`} key={crypto.randomUUID()}>
                     {`r ${window.utils.RoundNumber(raio, 2)}`}
                  </text>
               
            }

            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="white" strokeLinecap="round" strokeLinejoin="round" d={tempPath} key={crypto.randomUUID()} />
               {drawLines}
               {drawPoints}
               {circleElement}
               {infoText}
            </>
            return resultDraw;
         }
      },

      "arcTool": {
         tokenType: "arc",
         commandValue: {
            currentClick: 0,
            totalClicks: 3,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw =<></>;
            let tempPath = "";
            if(token.pontos.length == 2){
               let tempToken = {
                  type: "arc",
                  pontos: [
                     {x: token.pontos[0].x, y: token.pontos[0].y},
                     {x: token.pontos[1].x, y: token.pontos[1].y},
                     {x: config.svgMousePosX, y: config.svgMousePosY}
                  ],
                  options: {
                     winding: config.winding,
                     polygonSides: config.polygonSides,
                     cornerType: config.cornerType,
                     filletSize: config.filletSize,
                  }
               }
               tempPath = TokenHelper.convertTokenToPath(tempToken);
            }
            
            let drawPoints = [];
            let drawLines = [];
            let infoText = <></>
            let circleElement = <></>
            
            if(token.pontos.length > 0){
               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                     strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
                  drawPoints.push(dot)
               }
            }
            
            let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
               strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
            drawPoints.push(dot)
            
            if(token.pontos.length == 1){
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }
            else if(token.pontos.length == 2){
               let linePosX = token.pontos[0].x;
               let linePosY = token.pontos[0].y;
               let finalX = token.pontos[1].x;
               let finalY = token.pontos[1].y;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);

               let pontoA = token.pontos[0];
               let pontoB = token.pontos[1];
               let mousePoint = {x: config.svgMousePosX, y: config.svgMousePosY}
               
               let mouseLine = <line x1={pontoA.x} y1={pontoA.y} x2={mousePoint.x} y2={mousePoint.y} stroke="orange" strokeWidth={config.strokePixel}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(mouseLine);

               let vec = new Vector2D(pontoA, pontoB);
               let vecMouse = new Vector2D(pontoA, mousePoint);
               let arcRadius = vec.getLenght();

               let normalVec = new Vector2D(pontoA, {x:pontoA.x + vec.ln.x , y: pontoA.y + vec.ln.y});
               let normalVecMouse = new Vector2D(pontoA, {x:pontoA.x + vecMouse.ln.x , y: pontoA.y + vecMouse.ln.y});
               
               //pontos helpers pra ver as normais 
               // let dotA = <circle cx={normalVec.p2.x} cy={normalVec.p2.y} r={config.anchorRadius} fill="white" stroke="black"
               //    strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"}/>
               // drawPoints.push(dotA);
               // let dotB = <circle cx={normalVecMouse.p2.x} cy={normalVecMouse.p2.y} r={config.anchorRadius} fill="yellow" stroke="black"
               //    strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"}/>
               // drawPoints.push(dotB);
               // let normalLine = <line x1={normalVec.p1.x} y1={normalVec.p1.y} x2={normalVec.p2.x} y2={normalVec.p2.y} stroke="yellow" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"}/>
               // drawLines.push(normalLine);
               // let mouseLineNormal = <line x1={normalVecMouse.p1.x} y1={normalVecMouse.p1.y} x2={normalVecMouse.p2.x} y2={normalVecMouse.p2.y} stroke="green" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"}/>
               // drawLines.push(mouseLineNormal);
               
               let cosTheta = dotProduct(vec, vecMouse) / (vec.getLenght() * vecMouse.getLenght());
               let angleRad = Math.acos(cosTheta);
               let angle = window.utils.RadToDeg(angleRad); //works //0 a 180, quero de 0 a 360...

               let dotNormals = dotProduct(normalVec, vecMouse);
               if(dotNormals < 0){
                  angle = (180 - angle) + 180;
               }
               
               ////testar o angulo com Math.atan2
               // let atanA = Math.atan2(token.pontos[1].y - token.pontos[0].y ,  token.pontos[1].x - token.pontos[0].x);
               // let atanB = Math.atan2(mousePoint.y - token.pontos[0].y , mousePoint.x- token.pontos[0].x);
               // let angleAtan2 = atanB - atanA;//wrap isso entre 0 e 360, e resolver os negativos
               // let AngleDegreesAtan2 = window.utils.RadToDeg(angleAtan2);
               // angle = AngleDegreesAtan2;

               infoText = <>
                     <text x={pontoA.x} y={pontoA.y + (20 / config.scale)} stroke="orange" strokeWidth={.1}
                     vectorEffect={"non-scaling-stroke"} fill="orange" fontSize={`${12 / config.scale}px`} key={crypto.randomUUID()}>
                        {`A ${window.utils.RoundNumber(angle, 1)}°`}
                     </text>
                     <text x={vec.midX} y={vec.midY - (20 / config.scale)} stroke="orange" strokeWidth={.1}
                     vectorEffect={"non-scaling-stroke"} fill="orange" fontSize={`${12 / config.scale}px`} key={crypto.randomUUID()}>
                        {`r ${window.utils.RoundNumber(arcRadius, 1)}`}
                     </text>
                  </>

            }
            
            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="orange" strokeLinecap="round" strokeLinejoin="round" d={tempPath} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               {drawLines}
               {drawPoints}
               {circleElement}
               {infoText}
            </>
            return resultDraw;
         }
      },
      
      "bezierTool":{
         tokenType: "bezier",
         commandValue: {
            currentClick: 0,
            totalClicks: 4, //totalClicks: Number.MAX_SAFE_INTEGER,???
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw =<></>;
            let tempPath = "";
            let drawPoints = [];
            let drawLines = [];
            let infoText = <></>
            let circleElement = <></>

            let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
               strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
            drawPoints.push(dot);
            
            if(token.pontos.length > 0){
               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black" key={crypto.randomUUID()}
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} />
                  drawPoints.push(dot)
               }
            }

            if(token.pontos.length === 1){//estou botando o endPoint
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }
            else if(token.pontos.length === 2){//estou botando o primeiro control point
               let newToken = {
                  type: "bezier",
                  pontos: [
                     {x: token.pontos[0].x, y: token.pontos[0].y},
                     {x: config.svgMousePosX, y: config.svgMousePosY},
                     {x: token.pontos[1].x, y: token.pontos[1].y},
                     {x: token.pontos[1].x, y: token.pontos[1].y},
                  ]
               }
               tempPath = TokenHelper.convertTokenToPath(newToken);
               
               let pontoA = token.pontos[0];
               let pontoB = token.pontos[1];
               let mousePoint = {x: config.svgMousePosX, y: config.svgMousePosY}
               
               let mouseLine = <line x1={pontoA.x} y1={pontoA.y} x2={mousePoint.x} y2={mousePoint.y} stroke="orange" strokeWidth={config.strokePixel}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(mouseLine);

            }

            else if(token.pontos.length === 3){//ultimo ponto da bezier
               let newToken = {
                  type: "bezier",
                  pontos: [
                     {x: token.pontos[0].x, y: token.pontos[0].y},
                     {x: token.pontos[2].x, y: token.pontos[2].y},
                     {x: config.svgMousePosX, y: config.svgMousePosY},
                     {x: token.pontos[1].x, y: token.pontos[1].y},
                  ]
               }
               tempPath = TokenHelper.convertTokenToPath(newToken);

               let pontoA = token.pontos[0];
               let pontoB = token.pontos[1];
               let cPoint1 = token.pontos[2];
               let mousePoint = {x: config.svgMousePosX, y: config.svgMousePosY}//aqui o cPoint2 eh o mouse point
               let ctrlLine = <line x1={pontoA.x} y1={pontoA.y} x2={cPoint1.x} y2={cPoint1.y} stroke="orange" strokeWidth={config.strokePixel}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               let mouseLine = <line x1={pontoB.x} y1={pontoB.y} x2={mousePoint.x} y2={mousePoint.y} stroke="orange" strokeWidth={config.strokePixel}
                  vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(ctrlLine);
               drawLines.push(mouseLine);
            }
            
            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="orange" strokeLinecap="round" strokeLinejoin="round" d={tempPath} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               {drawLines}
               {drawPoints}
            </>
            return resultDraw;
         }
      },

      "rectTool":{
         tokenType: "rect",
         commandValue: {
            currentClick: 0,
            totalClicks: 2,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw = <></>;
            let drawPoints = [];
            let drawLines = [];
            let tempPath = "";
            
            //mouse pos
            let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
            drawPoints.push(dot);
            
            if(token.pontos.length > 0){
               let tempToken = {
                  type: "rect",
                  pontos: [
                     {x: token.pontos[0].x, y: token.pontos[0].y},
                     {x: config.svgMousePosX, y: config.svgMousePosY},
                  ],
                  options: {
                     winding: config.winding,
                     polygonSides: config.polygonSides,
                     cornerType: config.cornerType,
                     filletSize: config.filletSize,
                  }
               }
               tempPath = TokenHelper.convertTokenToPath(tempToken);

               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                     strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                     />
                  drawPoints.push(dot)
               }
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }

            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="orange" strokeLinecap="round" strokeLinejoin="round" d={tempPath} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               {drawLines}
               {drawPoints}
            </>
            return resultDraw;
         }
      },

      "polygonTool":{
         tokenType: "polygon",
         commandValue: {
            currentClick: 0,
            totalClicks: 2,
            reset(){
               this.currentClick = 0;
            },
            update(){
               this.currentClick++;
               if(this.currentClick > this.totalClicks - 1){
                  return 1;//falta 1 click
               }
               return 0;
            }
         },
         DrawingFunction(token, config){
            if(token === null) return <></>;
            let resultDraw = <></>;
            let drawPoints = [];
            let drawLines = [];
            let tempPath = "";
            //mouse pos
            let dot = <circle cx={config.svgMousePosX} cy={config.svgMousePosY} r={config.anchorRadius} fill="white" stroke="black"
                  strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
            drawPoints.push(dot);
            
            if(token.pontos.length > 0){
               let tempToken = {
                  type: "polygon",
                  pontos: [
                     {x: token.pontos[0].x, y: token.pontos[0].y},
                     {x: config.svgMousePosX, y: config.svgMousePosY},
                  ],
                  options: {
                     winding: config.winding,
                     polygonSides: config.polygonSides,
                     cornerType: config.cornerType,
                     filletSize: config.filletSize,
                  }
               }
               tempPath = TokenHelper.convertTokenToPath(tempToken);

               for (let i = 0; i < token.pontos.length; i++){
                  let dot = <circle cx={token.pontos[i].x} cy={token.pontos[i].y} r={config.anchorRadius} fill="white" stroke="black"
                     strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}
                     />
                  drawPoints.push(dot)
               }
               let linePosX = token.pontos[token.pontos.length - 1].x;
               let linePosY = token.pontos[token.pontos.length - 1].y;
               let finalX = config.svgMousePosX;
               let finalY = config.svgMousePosY;
               let newLine = <line x1={linePosX} y1={linePosY} x2={finalX} y2={finalY} stroke="orange" strokeWidth={config.strokePixel} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               drawLines.push(newLine);
            }
            
            resultDraw =<>
               <path drawing="TempDisplay" strokeWidth={1.2} stroke="orange" strokeLinecap="round" strokeLinejoin="round" d={tempPath} vectorEffect={"non-scaling-stroke"} key={crypto.randomUUID()}/>
               {drawLines}
               {drawPoints}
            </>
            return resultDraw;
         }
      }

   }
}


const CONSTANTS = {
   "topLeftCos": Math.cos(DegToRad(-135)),
   "topLeftSin": Math.sin(DegToRad(-135)),

   "botLeftCos": Math.cos(DegToRad(135)),
   "botLeftSin": Math.sin(DegToRad(135)),

   "botRightCos": Math.cos(DegToRad(45)),
   "botRightSin": Math.sin(DegToRad(45)),

   "topRightCos": Math.cos(DegToRad(-45)),
   "topRightSin": Math.sin(DegToRad(-45)),

   "leftCos": Math.cos(DegToRad(180)),
   "leftSin": Math.sin(DegToRad(180)),

   "rightCos": Math.cos(DegToRad(0)),
   "rightSin": Math.sin(DegToRad(0)),

   "topCos": Math.cos(DegToRad(-90)),
   "topSin": Math.sin(DegToRad(-90)),

   "botCos": Math.cos(DegToRad(90)),
   "botSin": Math.sin(DegToRad(90)),
}

export const TokenHelper = {
   createTokenTemplate(tokenType, optionsPar){
      let Token = {
         type: tokenType,
         pontos:[],
         options: optionsPar,
      };
      return Token;
   },
   convertTokenToPath(token){
      //posso salvar o calculo desse path no token...e caso nao hajaa alteracao...
      
      let tokenPath = "";
      if(token === null) return tokenPath;
      const options = token.options;
      if(token.type === "line"){
         if(token.pontos.length > 1){
         tokenPath += ` M ${token.pontos[0].x} ${token.pontos[0].y} `;
            for(let i = 1; i < token.pontos.length; i++){
               tokenPath += ` L ${token.pontos[i].x} ${token.pontos[i].y}`;
            }
         }
      }
      else if(token.type === "circle"){
         if(token.pontos.length === 2){
            let cx = token.pontos[0].x;
            let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy);
            tokenPath = buildCirclePath(cx, cy, raio, options);
         }
      }
      else if(token.type === "circle e"){
         if(token.pontos.length === 2){
            // let cx = token.pontos[0].x;
            // let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy) / 2;
            let centroX = token.pontos[0].x + dx * 0.5;
            let centroY = token.pontos[0].y + dy * 0.5;
            tokenPath = buildCirclePath(centroX, centroY, raio, options);
         }
      }
      else if(token.type === "arc"){
         if(token.pontos.length === 3){
            let pontoA = token.pontos[0];
            let pontoB = token.pontos[1];
            let mousePoint = token.pontos[2];
            
            let vec = new Vector2D(pontoA, pontoB);
            let vecMouse = new Vector2D(pontoA, mousePoint);
            let arcRadius = vec.getLenght();
            
            let normalVec = new Vector2D(pontoA, {x:pontoA.x + vec.ln.x , y: pontoA.y + vec.ln.y});
            let normalVecMouse = new Vector2D(pontoA, {x:pontoA.x + vecMouse.ln.x , y: pontoA.y + vecMouse.ln.y});
            
            let dotNormals = dotProduct(normalVec, vecMouse);
            let cosTheta = dotProduct(vec, vecMouse) / (vec.getLenght() * vecMouse.getLenght());
            let angleRad = Math.acos(cosTheta);
            let angle = window.utils.RadToDeg(angleRad); //works //0 a 180, quero de 0 a 360...
            
            let eixoX = new Vector2D({x:0,y:0}, {x:1,y:0});
            let eixoXNormal = new Vector2D({x:0,y:0}, {x:0,y:-1});
            let dotNormalsEixoX = dotProduct(vec, eixoXNormal);
            let cosOffset = dotProduct(vec, eixoX) / (vec.getLenght() * eixoX.getLenght());
            let angleOffSetRad = Math.acos(cosOffset);
            let angleOffdegree = window.utils.RadToDeg(angleOffSetRad); //works //0 a 180, quero de 0 a 360...
            if(dotNormalsEixoX < 0){
               angleOffdegree = (180 - angleOffdegree) + 180;
            }
            
            
            //winding left
            let arcSide = "0 0";//0 0 funciona com vec indo pra direita -> reto...
            if(dotNormals < 0){
               angle = (180 - angle) + 180;
               arcSide = "1 0";
               if(options.winding === "right"){
                  arcSide = "0 1";
               }
            }
            angle += angleOffdegree;
            let finalAngleRad = window.utils.DegToRad(angle);
            
            //let finalAngleRad_Atan2 = Math.atan2(dy, dx);//acho que da pra simplificar TUDO com isso...

            let finalPosX = pontoA.x + Math.cos(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
            let finalPosY = pontoA.y - Math.sin(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
            
            tokenPath += ` M ${pontoB.x} ${pontoB.y} A ${arcRadius} ${arcRadius} ${0} ${arcSide} ${finalPosX} ${finalPosY}`;
            //tokenPath += ` M ${pontoB.x} ${pontoB.y} A ${arcRadius} ${arcRadius} ${0} ${arcSide} ${mousePoint.x} ${mousePoint.y}`;
            
         }
      }
      else if(token.type === "bezier"){
         if(token.pontos.length === 4){
            tokenPath += ` M ${token.pontos[0].x} ${token.pontos[0].y} `;
            tokenPath += ` C ${token.pontos[1].x} ${token.pontos[1].y} ${token.pontos[2].x} ${token.pontos[2].y} ${token.pontos[3].x} ${token.pontos[3].y}`;
         }
      }
      else if(token.type === "rect"){
         if(token.pontos.length === 2){
            //winding clockwise, ou counterclockwise
            if(options.cornerType === "none"){
               if(options.winding === "left"){
                  //o double space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
                  tokenPath += `  M ${token.pontos[0].x} ${token.pontos[0].y} `;
                  tokenPath += ` V ${token.pontos[1].y}`;
                  tokenPath += ` H ${token.pontos[1].x}`;
                  tokenPath += ` V ${token.pontos[0].y} Z`;
               }
               else if(options.winding === "right"){
                  //o double space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
                  tokenPath += `  M ${token.pontos[0].x} ${token.pontos[0].y} `;
                  tokenPath += ` H ${token.pontos[1].x}`;
                  tokenPath += ` V ${token.pontos[1].y}`;
                  tokenPath += ` H ${token.pontos[0].x} Z`;
               }
            }
            else{ //chanfer ou fillet
               let filletSize = options.filletSize;
               
               let xMin = token.pontos[0].x;
               let xMax = token.pontos[1].x;
               let yMin = token.pontos[0].y;
               let yMax = token.pontos[1].y;
               if(token.pontos[1].x < token.pontos[0].x){
                  xMin = token.pontos[1].x;
                  xMax = token.pontos[0].x;
               }
               if(token.pontos[1].y < token.pontos[0].y){
                  yMin = token.pontos[1].y;
                  yMax = token.pontos[0].y;
               }
               
               const width = xMax - xMin;
               const height = yMax - yMin;
               const halfWidth = width * 0.5;
               const halfHeight = height * 0.5;
               
               let heightV = height - (2 * filletSize);
               let widthH = width - (2 * filletSize);
               
               let y0 = yMin;
               let y1 = yMin + filletSize;
               let y2 = yMin + filletSize + heightV;
               let y3 = yMax;//yMin + height;

               let x0 = xMin;
               let x1 = xMin + filletSize;
               let x2 = xMin + filletSize + widthH;
               let x3 = xMax;//xMin + width;



               //o double white space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
               if(options.cornerType === "chanfer"){
                  if(options.winding === "left"){
                     if(heightV > 0 && widthH > 0){
                        tokenPath += `  M ${x0} ${y1} `;        //        7-----H-----6
                        tokenPath += ` V ${y2}`;                //      Z/             \L
                        tokenPath += ` L ${x1} ${y3}`;          //     M0               5 
                        tokenPath += ` H ${x2}`;                //     V|               |
                        tokenPath += ` L ${x3} ${y2}`;          //      |               |V
                        tokenPath += ` V ${y1}`;                //      1               4
                        tokenPath += ` L ${x2} ${y0}`;          //      L\             /L
                        tokenPath += ` H ${x1} Z`;//Z faz um L  //        2-----H-----3
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5; //se quiser distorcer, so tirar essa linha
                        x1 = x0 + filletSize;
                        x2 = x3 - filletSize;                          //              H
                        tokenPath += `  M ${x0} ${y0 + halfHeight} `;   //       5-------------4
                        tokenPath += ` L ${x1} ${y0 + height}`;        //     Z/               \L
                        tokenPath += ` H ${x2}`;                       //    M0                 3  
                        tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     L\               /L
                        tokenPath += ` L ${x2} ${y0}`;                 //       1-------------2
                        tokenPath += ` H ${x1} Z`;//Z faz um L         //              H
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                        y1 = y0 + filletSize;                                    //     L/ \Z
                        y2 = y3 - filletSize;                                    //     /   \
                        tokenPath += `  M ${x0 + halfWidth} ${y0} `;              //    1     5
                        tokenPath += ` L ${x0} ${y1}`;                           //  V |     | V
                        tokenPath += ` V ${y2}`;                                 //    2     4
                        tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                        tokenPath += ` L ${x0 + width} ${y2}`;                   //      \ /
                        tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                           y1 = y0 + filletSize;                                    //     L/ \Z
                           y2 = y3 - filletSize;                                    //     /   \
                           tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    1     5
                           tokenPath += ` L ${x0} ${y1}`;                           //  V |     | V
                           tokenPath += ` V ${y2}`;                                 //    2     4
                           tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                           tokenPath += ` L ${x0 + width} ${y2}`;                   //      \ /
                           tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3
                        }
                        else{
                           filletSize = height * 0.5; //se quiser distorcer, so tirar essa linha
                           x1 = x0 + filletSize;
                           x2 = x3 - filletSize;                          //              H
                           tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       5-------------4
                           tokenPath += ` L ${x1} ${y0 + height}`;        //     Z/               \L
                           tokenPath += ` H ${x2}`;                       //    M0                 3  
                           tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     L\               /L
                           tokenPath += ` L ${x2} ${y0}`;                 //       1-------------2
                           tokenPath += ` H ${x1} Z`;//Z faz um L         //              H
                        }
                        // se quiser fazer distorcido
                        // tokenPath += `  M ${x0} ${y0 + halfHeight} `;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0 + height}`;
                        // tokenPath += ` L ${x0 + width} ${y0 + halfHeight}`;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0} Z`;
                     }
                  }
                  else{//winding right
                     if(heightV > 0 && widthH > 0){
                        tokenPath += `  M ${x1} ${y0} `;       //       M0-----H-----1
                        tokenPath += ` H ${x2}`;               //      Z/             \L
                        tokenPath += ` L ${x3} ${y1}`;         //      7               2 
                        tokenPath += ` V ${y2}`;               //     V|               |
                        tokenPath += ` L ${x2} ${y3}`;         //      |               |V
                        tokenPath += ` H ${x1}`;               //      6               3
                        tokenPath += ` L ${x0} ${y2}`;         //      L\             /L
                        tokenPath += ` V ${y1} Z`;             //        5-----H-----4
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;
                        x1 = x0 + filletSize;
                        x2 = x3 - filletSize;                          //              H
                        tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       1-------------2
                        tokenPath += ` L ${x1} ${y0}`;                 //     L/               \L
                        tokenPath += ` H ${x2}`;                       //    M0                 3  
                        tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     Z\               /L
                        tokenPath += ` L ${x2} ${y0 + height}`;        //       5-------------4
                        tokenPath += ` H ${x1} Z`;//Z faz um L         //              H
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                        y1 = y0 + filletSize;                                    //     L/ \Z
                        y2 = y3 - filletSize;                                    //     /   \
                        tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    5     1
                        tokenPath += ` L ${x0 + width} ${y1}`;                   //  V |     | V
                        tokenPath += ` V ${y2}`;                                 //    4     2
                        tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                        tokenPath += ` L ${x0} ${y2}`;                           //      \ /
                        tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                           y1 = y0 + filletSize;                                    //     L/ \Z
                           y2 = y3 - filletSize;                                    //     /   \
                           tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    5     1
                           tokenPath += ` L ${x0 + width} ${y1}`;                   //  V |     | V
                           tokenPath += ` V ${y2}`;                                 //    4     2
                           tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                           tokenPath += ` L ${x0} ${y2}`;                           //      \ /
                           tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3
                        }
                        else{
                           filletSize = height * 0.5;
                           x1 = x0 + filletSize;
                           x2 = x3 - filletSize;                          //              H
                           tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       1-------------2
                           tokenPath += ` L ${x1} ${y0}`;                 //     L/               \L
                           tokenPath += ` H ${x2}`;                       //    M0                 3  
                           tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     Z\               /L
                           tokenPath += ` L ${x2} ${y0 + height}`;        //       5-------------4
                           tokenPath += ` H ${x1} Z`;//Z faz um L         //              H
                        }
                        // tokenPath += `  M ${x0} ${y0 + halfHeight} `;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0}`; 
                        // tokenPath += ` L ${x0 + width} ${y0 + halfHeight}`;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0 + height} Z`;
                     }
                  }
               }
               else if(options.cornerType === "fillet"){
                  
                  if(options.winding === "left"){
                     let arcSide = "0 0";//0 1 - inside small , 1 1 - inside big, 1 0 - castelinho, 0 0 default fillet
                     if(heightV > 0 && widthH > 0){//normal
                        tokenPath += `  M ${x1} ${y0} `;                                                 //      M0------Z-----7 
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1}`;          //     A/              \A
                        tokenPath += ` V ${y2}`;                                                         //     1                6
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y3}`;          //    V|                |
                        tokenPath += ` H ${x2}`;                                                         //     |                |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x3} ${y2}`;          //     2                5
                        tokenPath += ` V ${y1}`;                                                         //     A\              /A
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;        //       3------H-----4
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                        x1 = x0 + filletSize;                                                              //       M0-----Z-----3
                        x2 = x3 - filletSize;                                                              //       /             \
                        tokenPath += `  M ${x1} ${y0} `;                                                   //      /               \
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0 + height}`;   //    A \               / A
                        tokenPath += ` H ${x2}`;                                                           //       \             /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;          //        1-----H-----2
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;                                                         //      /\A
                        y1 = y0 + filletSize;                                                             //     /  \
                        y2 = y3 - filletSize;                                                             //    3    2
                        tokenPath += `  M ${x0} ${y2} `;                                                  //   Z|    |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y2}`;   //   M0    1
                        tokenPath += ` V ${y1}`;                                                          //     \  /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1} Z`;         //      \/A
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;                                                         //      /\A
                           y1 = y0 + filletSize;                                                             //     /  \
                           y2 = y3 - filletSize;                                                             //    3    2
                           tokenPath += `  M ${x0} ${y2} `;                                                  //   Z|    |V
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y2}`;   //   M0    1
                           tokenPath += ` V ${y1}`;                                                          //     \  /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1} Z`;         //      \/A
                        }
                        else{
                           filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                           x1 = x0 + filletSize;                                                              //       M0-----Z-----3
                           x2 = x3 - filletSize;                                                              //       /             \
                           tokenPath += `  M ${x1} ${y0} `;                                                   //      /               \
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0 + height}`;   //    A \               / A
                           tokenPath += ` H ${x2}`;                                                           //       \             /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;          //        1-----H-----2
                        }
                     }
                  }
                  else{//winding right
                     let arcSide = "0 1";
                     if(heightV > 0 && widthH > 0){//normal
                        tokenPath += `  M ${x0} ${y1} `;                                                 //       1-----H-----2 
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;          //     A/             \A
                        tokenPath += ` H ${x2}`;                                                         //    M0               3
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x3} ${y1}`;          //     |               |
                        tokenPath += ` V ${y2}`;                                                         //    Z|               |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y3}`;          //     7               4
                        tokenPath += ` H ${x1}`;                                                         //     A\             /A
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;        //       6-----H-----5
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                        x1 = x0 + filletSize;                                                             //        1-----Z-----2
                        x2 = x3 - filletSize;                                                             //       /             \
                        tokenPath += `  M ${x1} ${y0 + height} `;                                         //      /               \
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;           //    A \               / A
                        tokenPath += ` H ${x2}`;                                                          //       \             /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0+height} Z`;  //       M0-----H-----3
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;                                                         //      /\A
                        y1 = y0 + filletSize;                                                             //     /  \
                        y2 = y3 - filletSize;                                                             //   M0    1
                        tokenPath += `  M ${x0} ${y1} `;                                                  //   Z|    |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y1}`;   //    3    2
                        tokenPath += ` V ${y2}`;                                                          //     \  /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;         //      \/A
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;                                                         //      /\A
                           y1 = y0 + filletSize;                                                             //     /  \
                           y2 = y3 - filletSize;                                                             //   M0    1
                           tokenPath += `  M ${x0} ${y1} `;                                                  //   Z|    |V
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y1}`;   //    3    2
                           tokenPath += ` V ${y2}`;                                                          //     \  /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;         //      \/A
                        }
                        else{
                           filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                           x1 = x0 + filletSize;                                                             //        1-----Z-----2
                           x2 = x3 - filletSize;                                                             //       /             \
                           tokenPath += `  M ${x1} ${y0 + height} `;                                         //      /               \
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;           //    A \               / A
                           tokenPath += ` H ${x2}`;                                                          //       \             /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0+height} Z`;  //       M0-----H-----3
                        }
                     }
                  }
               }
            }
         }
            
      }

      else if(token.type === "polygon"){
         if(token.pontos.length === 2){
            let cx = token.pontos[0].x;
            let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy);
            
            let startRad = Math.atan2(dy, dx) * -1; //-Pi to Pi
            let increaseInRad = (Math.PI * 2) / options.polygonSides;
            let polygonsPoints = [];
            for(let i = 0; i < options.polygonSides; i++){
               let posX = cx + Math.cos(startRad) * raio;
               let posY = cy - Math.sin(startRad) * raio;
               polygonsPoints.push({x: posX, y: posY});
               startRad += increaseInRad;
            }

            //double space pra nao comer no simplify do path
            tokenPath += `  M ${polygonsPoints[0].x} ${polygonsPoints[0].y} `;
            for(let i = 1; i < polygonsPoints.length; i++){
               tokenPath += ` L ${polygonsPoints[i].x} ${polygonsPoints[i].y}`;
            }
            tokenPath += ` L ${polygonsPoints[0].x} ${polygonsPoints[0].y}`;
            
         }
         
      }

      return tokenPath;
      
   },
   
   convertTokenToPathAndOrganize(token, lines, circles, anchorPoints, tokenID){
      let tokenPath = "";
      if(token === null) return objects;
      const options = token.options;

      if(token.type === "line"){
         if(token.pontos.length > 1){
            tokenPath += ` M ${token.pontos[0].x} ${token.pontos[0].y} `;
            let p1 = token.pontos[0];
            for(let i = 1; i < token.pontos.length; i++){
               tokenPath += ` L ${token.pontos[i].x} ${token.pontos[i].y}`;

               let p2 = token.pontos[i];
               let line = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
               p1 = token.pontos[i];
               lines.push(line);
               //se eu quiser que a linha de um layer acerte de outro layer, eu tenho que botar essa info
               //no objeto, e quando for calcular o intersect levar isso em consideracao
               //ainda nao sei...


               let idMiddle = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"mid"};
               anchorPoints.push({pt: line.vec.midP, id: idMiddle});

               let idEnd = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: i, type:"end"};
               anchorPoints.push({pt: token.pontos[i], id: idEnd});
            }
            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
         }
         
      }
      else if(token.type === "circle"){
         if(token.pontos.length === 2){
            let cx = token.pontos[0].x;
            let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy);
            tokenPath = buildCirclePath(cx, cy, raio, options);

            let circle = {vec: new Vector2D(token.pontos[0], token.pontos[1]), pathID:tokenID.pathIndex};//raio eh circle.getLenght()
            circles.push(circle);

            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});

         }
      }
      else if(token.type === "circle e"){
         if(token.pontos.length === 2){
            // let cx = token.pontos[0].x;
            // let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy) / 2;
            let centroX = token.pontos[0].x + dx * 0.5;
            let centroY = token.pontos[0].y + dy * 0.5;
            tokenPath = buildCirclePath(centroX, centroY, raio, options);

            let circle = {vec: new Vector2D({x:centroX, y: centroY}, token.pontos[1]), pathID:tokenID.pathIndex};//raio eh circle.getLenght()
            circles.push(circle);

            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});
         }
      }
      else if(token.type === "polygon"){
         if(token.pontos.length === 2){
            let cx = token.pontos[0].x;
            let cy = token.pontos[0].y;
            let dx = token.pontos[1].x - token.pontos[0].x;
            let dy = token.pontos[1].y - token.pontos[0].y;
            let raio = Math.sqrt(dx * dx + dy*dy);
            
            let startRad = Math.atan2(dy, dx) * -1; //-Pi to Pi
            let increaseInRad = (Math.PI * 2) / options.polygonSides;
            let polygonsPoints = [];

            for(let i = 0; i < options.polygonSides; i++){
               let posX = cx + Math.cos(startRad) * raio;
               let posY = cy - Math.sin(startRad) * raio;
               polygonsPoints.push({x: posX, y: posY});
               startRad += increaseInRad;

               let posX2 = cx + Math.cos(startRad) * raio;
               let posY2 = cy - Math.sin(startRad) * raio;
               

               let line = {vec:new Vector2D({x:posX, y:posY}, {x:posX2, y:posY2}), pathID:tokenID.pathIndex};
               lines.push(line);

               if(i != 0){//o primeiro ponto dos sides eh um anchor
                  let idNada = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"end"};
                  anchorPoints.push({pt: {x:posX, y:posY}, id: idNada});
               }
               let idMid = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"mid"};
               anchorPoints.push({pt: line.vec.midP, id: idMid});
               
            }

            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});

            //double space pra nao comer no simplify do path
            tokenPath += `  M ${polygonsPoints[0].x} ${polygonsPoints[0].y} `;
            for(let i = 1; i < polygonsPoints.length; i++){
               tokenPath += ` L ${polygonsPoints[i].x} ${polygonsPoints[i].y}`;
            }
            tokenPath += ` L ${polygonsPoints[0].x} ${polygonsPoints[0].y}`;
            
         }
         
      }
      else if(token.type === "arc"){
         if(token.pontos.length === 3){
            let pontoA = token.pontos[0];
            let pontoB = token.pontos[1];
            let mousePoint = token.pontos[2];
            
            let vec = new Vector2D(pontoA, pontoB);
            let vecMouse = new Vector2D(pontoA, mousePoint);
            let arcRadius = vec.getLenght();
            
            let normalVec = new Vector2D(pontoA, {x:pontoA.x + vec.ln.x , y: pontoA.y + vec.ln.y});
            let normalVecMouse = new Vector2D(pontoA, {x:pontoA.x + vecMouse.ln.x , y: pontoA.y + vecMouse.ln.y});
            
            let dotNormals = dotProduct(normalVec, vecMouse);
            let cosTheta = dotProduct(vec, vecMouse) / (vec.getLenght() * vecMouse.getLenght());
            let angleRad = Math.acos(cosTheta);
            let angle = window.utils.RadToDeg(angleRad); //works //0 a 180, quero de 0 a 360...
            
            let eixoX = new Vector2D({x:0,y:0}, {x:1,y:0});
            let eixoXNormal = new Vector2D({x:0,y:0}, {x:0,y:-1});
            let dotNormalsEixoX = dotProduct(vec, eixoXNormal);
            let cosOffset = dotProduct(vec, eixoX) / (vec.getLenght() * eixoX.getLenght());
            let angleOffSetRad = Math.acos(cosOffset);
            let angleOffdegree = window.utils.RadToDeg(angleOffSetRad); //works //0 a 180, quero de 0 a 360...
            if(dotNormalsEixoX < 0){
               angleOffdegree = (180 - angleOffdegree) + 180;
            }
            
            
            //winding left
            let arcSide = "0 0";//0 0 funciona com vec indo pra direita -> reto...
            if(dotNormals < 0){
               angle = (180 - angle) + 180;
               arcSide = "1 0";
               if(options.winding === "right"){
                  arcSide = "0 1";
               }
            }

            let angleBeforeOffset = angle;
            angle += angleOffdegree;
            let finalAngleRad = window.utils.DegToRad(angle);
            
            //let finalAngleRad_Atan2 = Math.atan2(dy, dx);//acho que da pra simplificar TUDO com isso...

            let finalPosX = pontoA.x + Math.cos(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
            let finalPosY = pontoA.y - Math.sin(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
            
            tokenPath += ` M ${pontoB.x} ${pontoB.y} A ${arcRadius} ${arcRadius} ${0} ${arcSide} ${finalPosX} ${finalPosY}`;
            //tokenPath += ` M ${pontoB.x} ${pontoB.y} A ${arcRadius} ${arcRadius} ${0} ${arcSide} ${mousePoint.x} ${mousePoint.y}`;
            
            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"end"};
            let id2 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 2, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});
            anchorPoints.push({pt: token.pontos[2], id: id2});

            let halfAngleRad = window.utils.DegToRad(angleBeforeOffset / 2 + angleOffdegree);//left winding
            if(options.winding === "right" && dotNormals < 0){
               halfAngleRad = window.utils.DegToRad((angleBeforeOffset / 2 + angleOffdegree) + 180);//left winding
            }
            let id3 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"mid"};
            let midPointX = pontoA.x + Math.cos(halfAngleRad) * arcRadius;
            let midPointY = pontoA.y - Math.sin(halfAngleRad) * arcRadius;
            let middlePoint = {x: midPointX, y: midPointY};
            anchorPoints.push({pt: middlePoint, id: id3});
         }
      }

      else if(token.type === "bezier"){
         if(token.pontos.length === 4){
            tokenPath += ` M ${token.pontos[0].x} ${token.pontos[0].y} `;
            tokenPath += ` C ${token.pontos[1].x} ${token.pontos[1].y} ${token.pontos[2].x} ${token.pontos[2].y} ${token.pontos[3].x} ${token.pontos[3].y}`;

            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"b_control1"};//control
            let id2 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 2, type:"b_control2"};//control
            let id3 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 3, type:"end"};
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});
            anchorPoints.push({pt: token.pontos[2], id: id2});
            anchorPoints.push({pt: token.pontos[3], id: id3});
         }
      }


      else if(token.type === "rect"){
         if(token.pontos.length === 2){

            let id0 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 0, type:"end"};
            let id1 = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: 1, type:"end"};
            let idPointEnd = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"end"};
            let idPointMid = {pathID: tokenID.pathIndex, tokenIndex: tokenID.tokenIndex, pIndex: -1, type:"mid"};
            //base do rect
            anchorPoints.push({pt: token.pontos[0], id: id0});
            anchorPoints.push({pt: token.pontos[1], id: id1});

            //winding clockwise, ou counterclockwise
            if(options.cornerType === "none"){
               if(options.winding === "left"){
                  //o double space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
                  tokenPath += `  M ${token.pontos[0].x} ${token.pontos[0].y} `;
                  tokenPath += ` V ${token.pontos[1].y}`;
                  tokenPath += ` H ${token.pontos[1].x}`;
                  tokenPath += ` V ${token.pontos[0].y} Z`;
               }
               else if(options.winding === "right"){
                  //o double space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
                  tokenPath += `  M ${token.pontos[0].x} ${token.pontos[0].y} `;
                  tokenPath += ` H ${token.pontos[1].x}`;
                  tokenPath += ` V ${token.pontos[1].y}`;
                  tokenPath += ` H ${token.pontos[0].x} Z`;
               }

               let p1 = token.pontos[0];
               let p2 = {x:token.pontos[0].x , y: token.pontos[1].y}
               let p3 = token.pontos[1];
               let p4 = {x:token.pontos[1].x , y: token.pontos[0].y}
               
               let line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
               let line2 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
               let line3 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
               let line4 = {vec:new Vector2D(p4, p1), pathID:tokenID.pathIndex};
               lines.push(line1);
               lines.push(line2);
               lines.push(line3);
               lines.push(line4);
               
               anchorPoints.push({pt: p2, id: idPointEnd});
               anchorPoints.push({pt: p4, id: idPointEnd});
               
               anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
               anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
               anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
               anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                             

            }
            else{ //chanfer ou fillet
               let filletSize = options.filletSize;
               
               let xMin = token.pontos[0].x;
               let xMax = token.pontos[1].x;
               let yMin = token.pontos[0].y;
               let yMax = token.pontos[1].y;
               if(token.pontos[1].x < token.pontos[0].x){
                  xMin = token.pontos[1].x;
                  xMax = token.pontos[0].x;
               }
               if(token.pontos[1].y < token.pontos[0].y){
                  yMin = token.pontos[1].y;
                  yMax = token.pontos[0].y;
               }
               
               const width = xMax - xMin;
               const height = yMax - yMin;
               const halfWidth = width * 0.5;
               const halfHeight = height * 0.5;
               
               let heightV = height - (2 * filletSize);
               let widthH = width - (2 * filletSize);
               
               let y0 = yMin;
               let y1 = yMin + filletSize;
               let y2 = yMin + filletSize + heightV;
               let y3 = yMax;//yMin + height;

               let x0 = xMin;
               let x1 = xMin + filletSize;
               let x2 = xMin + filletSize + widthH;
               let x3 = xMax;//xMin + width;



               //o double white space no primeiro move eh FUNDAMENTAL, pra evitar o reducer de path de "comer" esse move
               if(options.cornerType === "chanfer"){
                  if(options.winding === "left"){
                     if(heightV > 0 && widthH > 0){
                        tokenPath += `  M ${x0} ${y1} `;        //        7-----H-----6
                        tokenPath += ` V ${y2}`;                //      Z/             \L
                        tokenPath += ` L ${x1} ${y3}`;          //     M0               5 
                        tokenPath += ` H ${x2}`;                //     V|               |
                        tokenPath += ` L ${x3} ${y2}`;          //      |               |V
                        tokenPath += ` V ${y1}`;                //      1               4
                        tokenPath += ` L ${x2} ${y0}`;          //      L\             /L
                        tokenPath += ` H ${x1} Z`;//Z faz um L  //        2-----H-----3

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y1};
                        const p1 = {x:x0 , y: y2};
                        const p2 = {x:x1 , y: y3};
                        const p3 = {x:x2 , y: y3};
                        const p4 = {x:x3 , y: y2};
                        const p5 = {x:x3 , y: y1};
                        const p6 = {x:x2 , y: y0};
                        const p7 = {x:x1 , y: y0};
                        
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p6), pathID:tokenID.pathIndex};
                        const line7 = {vec:new Vector2D(p6, p7), pathID:tokenID.pathIndex};
                        const line8 = {vec:new Vector2D(p7, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2, line3, line4, line5, line6, line7, line8);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: p6, id: idPointEnd});
                        anchorPoints.push({pt: p7, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line7.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line8.vec.midP, id: idPointMid});
                        
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5; //se quiser distorcer, so tirar essa linha
                        x1 = x0 + filletSize;
                        x2 = x3 - filletSize;                          //              H
                        tokenPath += `  M ${x0} ${y0 + halfHeight} `;   //       5-------------4
                        tokenPath += ` L ${x1} ${y0 + height}`;        //     Z/               \L
                        tokenPath += ` H ${x2}`;                       //    M0                 3  
                        tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     L\               /L
                        tokenPath += ` L ${x2} ${y0}`;                 //       1-------------2
                        tokenPath += ` H ${x1} Z`;//Z faz um L         //              H

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y0 + halfHeight};
                        const p1 = {x:x1 , y: y0 + height};
                        const p2 = {x:x2 , y: y0 + height};
                        const p3 = {x:x3 , y: y0 + halfHeight};
                        const p4 = {x:x2 , y: y0};
                        const p5 = {x:x1 , y: y0};
                                                
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                        
                        lines.push(line1, line2, line3, line4, line5, line6);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                        
                        
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                        y1 = y0 + filletSize;                                    //     L/ \Z
                        y2 = y3 - filletSize;                                    //     /   \
                        tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    1     5
                        tokenPath += ` L ${x0} ${y1}`;                           //  V |     | V
                        tokenPath += ` V ${y2}`;                                 //    2     4
                        tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                        tokenPath += ` L ${x0 + width} ${y2}`;                   //      \ /
                        tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3

                        //todos pontos dos cantos
                        const p0 = {x:x0 + halfWidth , y: y0};
                        const p1 = {x:x0 , y: y1};
                        const p2 = {x:x0 , y: y2};
                        const p3 = {x:x0 + halfWidth , y: y3};
                        const p4 = {x:x0 + width , y: y2};
                        const p5 = {x:x0 + width , y: y1};
                                                
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                        
                        lines.push(line1, line2, line3, line4, line5, line6);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                           y1 = y0 + filletSize;                                    //     L/ \Z
                           y2 = y3 - filletSize;                                    //     /   \
                           tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    1     5
                           tokenPath += ` L ${x0} ${y1}`;                           //  V |     | V
                           tokenPath += ` V ${y2}`;                                 //    2     4
                           tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                           tokenPath += ` L ${x0 + width} ${y2}`;                   //      \ /
                           tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3

                           //todos pontos dos cantos
                           const p0 = {x:x0 + halfWidth , y: y0};
                           const p1 = {x:x0 , y: y1};
                           const p2 = {x:x0 , y: y2};
                           const p3 = {x:x0 + halfWidth , y: y3};
                           const p4 = {x:x0 + width , y: y2};
                           const p5 = {x:x0 + width , y: y1};
                                                   
                           const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                           const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                           const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                           const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                           
                           lines.push(line1, line2, line3, line4, line5, line6);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: p4, id: idPointEnd});
                           anchorPoints.push({pt: p5, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                        }
                        else{
                           filletSize = height * 0.5; //se quiser distorcer, so tirar essa linha
                           x1 = x0 + filletSize;
                           x2 = x3 - filletSize;                          //              H
                           tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       5-------------4
                           tokenPath += ` L ${x1} ${y0 + height}`;        //     Z/               \L
                           tokenPath += ` H ${x2}`;                       //    M0                 3  
                           tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     L\               /L
                           tokenPath += ` L ${x2} ${y0}`;                 //       1-------------2
                           tokenPath += ` H ${x1} Z`;//Z faz um L         //              H

                           //todos pontos dos cantos
                           const p0 = {x:x0 , y: y0 + halfHeight};
                           const p1 = {x:x1 , y: y0 + height};
                           const p2 = {x:x2 , y: y0 + height};
                           const p3 = {x:x3 , y: y0 + halfHeight};
                           const p4 = {x:x2 , y: y0};
                           const p5 = {x:x1 , y: y0};
                                                   
                           const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                           const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                           const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                           const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                           
                           lines.push(line1, line2, line3, line4, line5, line6);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: p4, id: idPointEnd});
                           anchorPoints.push({pt: p5, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line6.vec.midP, id: idPointMid});

                        }
                        // se quiser fazer distorcido
                        // tokenPath += `  M ${x0} ${y0 + halfHeight} `;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0 + height}`;
                        // tokenPath += ` L ${x0 + width} ${y0 + halfHeight}`;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0} Z`;
                     }
                  }
                  else{//WINDING RIGHT
                     if(heightV > 0 && widthH > 0){
                        tokenPath += `  M ${x1} ${y0} `;       //       M0-----H-----1
                        tokenPath += ` H ${x2}`;               //      Z/             \L
                        tokenPath += ` L ${x3} ${y1}`;         //      7               2 
                        tokenPath += ` V ${y2}`;               //     V|               |
                        tokenPath += ` L ${x2} ${y3}`;         //      |               |V
                        tokenPath += ` H ${x1}`;               //      6               3
                        tokenPath += ` L ${x0} ${y2}`;         //      L\             /L
                        tokenPath += ` V ${y1} Z`;             //        5-----H-----4

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y1};
                        const p1 = {x:x0 , y: y2};
                        const p2 = {x:x1 , y: y3};
                        const p3 = {x:x2 , y: y3};
                        const p4 = {x:x3 , y: y2};
                        const p5 = {x:x3 , y: y1};
                        const p6 = {x:x2 , y: y0};
                        const p7 = {x:x1 , y: y0};
                        
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p6), pathID:tokenID.pathIndex};
                        const line7 = {vec:new Vector2D(p6, p7), pathID:tokenID.pathIndex};
                        const line8 = {vec:new Vector2D(p7, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2, line3, line4, line5, line6, line7, line8);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: p6, id: idPointEnd});
                        anchorPoints.push({pt: p7, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line7.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line8.vec.midP, id: idPointMid});
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;
                        x1 = x0 + filletSize;
                        x2 = x3 - filletSize;                          //              H
                        tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       1-------------2
                        tokenPath += ` L ${x1} ${y0}`;                 //     L/               \L
                        tokenPath += ` H ${x2}`;                       //    M0                 3  
                        tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     Z\               /L
                        tokenPath += ` L ${x2} ${y0 + height}`;        //       5-------------4
                        tokenPath += ` H ${x1} Z`;//Z faz um L         //              H

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y0 + halfHeight};
                        const p1 = {x:x1 , y: y0 + height};
                        const p2 = {x:x2 , y: y0 + height};
                        const p3 = {x:x3 , y: y0 + halfHeight};
                        const p4 = {x:x2 , y: y0};
                        const p5 = {x:x1 , y: y0};
                                                
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                        
                        lines.push(line1, line2, line3, line4, line5, line6);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                        y1 = y0 + filletSize;                                    //     L/ \Z
                        y2 = y3 - filletSize;                                    //     /   \
                        tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    5     1
                        tokenPath += ` L ${x0 + width} ${y1}`;                   //  V |     | V
                        tokenPath += ` V ${y2}`;                                 //    4     2
                        tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                        tokenPath += ` L ${x0} ${y2}`;                           //      \ /
                        tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3

                        //todos pontos dos cantos
                        const p0 = {x:x0 + halfWidth , y: y0};
                        const p1 = {x:x0 , y: y1};
                        const p2 = {x:x0 , y: y2};
                        const p3 = {x:x0 + halfWidth , y: y3};
                        const p4 = {x:x0 + width , y: y2};
                        const p5 = {x:x0 + width , y: y1};
                                                
                        const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                        const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                        
                        lines.push(line1, line2, line3, line4, line5, line6);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;//se quiser distorcer, so tirar //      M0
                           y1 = y0 + filletSize;                                    //     L/ \Z
                           y2 = y3 - filletSize;                                    //     /   \
                           tokenPath += `  M ${x0 + halfWidth} ${y0} `;             //    5     1
                           tokenPath += ` L ${x0 + width} ${y1}`;                   //  V |     | V
                           tokenPath += ` V ${y2}`;                                 //    4     2
                           tokenPath += ` L ${x0 + halfWidth} ${y3}`;               //    L\   /L
                           tokenPath += ` L ${x0} ${y2}`;                           //      \ /
                           tokenPath += ` V ${y1} Z`;//Z faz um L                   //       3
                           
                           //todos pontos dos cantos
                           const p0 = {x:x0 + halfWidth , y: y0};
                           const p1 = {x:x0 , y: y1};
                           const p2 = {x:x0 , y: y2};
                           const p3 = {x:x0 + halfWidth , y: y3};
                           const p4 = {x:x0 + width , y: y2};
                           const p5 = {x:x0 + width , y: y1};
                                                   
                           const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                           const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                           const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                           const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                           
                           lines.push(line1, line2, line3, line4, line5, line6);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: p4, id: idPointEnd});
                           anchorPoints.push({pt: p5, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line6.vec.midP, id: idPointMid});
                        }
                        else{
                           filletSize = height * 0.5;
                           x1 = x0 + filletSize;
                           x2 = x3 - filletSize;                          //              H
                           tokenPath += `  M ${x0} ${y0 + halfHeight} `;  //       1-------------2
                           tokenPath += ` L ${x1} ${y0}`;                 //     L/               \L
                           tokenPath += ` H ${x2}`;                       //    M0                 3  
                           tokenPath += ` L ${x3} ${y0 + halfHeight}`;    //     Z\               /L
                           tokenPath += ` L ${x2} ${y0 + height}`;        //       5-------------4
                           tokenPath += ` H ${x1} Z`;//Z faz um L         //              H         

                           //todos pontos dos cantos
                           const p0 = {x:x0 , y: y0 + halfHeight};
                           const p1 = {x:x1 , y: y0 + height};
                           const p2 = {x:x2 , y: y0 + height};
                           const p3 = {x:x3 , y: y0 + halfHeight};
                           const p4 = {x:x2 , y: y0};
                           const p5 = {x:x1 , y: y0};
                                                   
                           const line1 = {vec:new Vector2D(p0, p1), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line3 = {vec:new Vector2D(p2, p3), pathID:tokenID.pathIndex};
                           const line4 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                           const line5 = {vec:new Vector2D(p4, p5), pathID:tokenID.pathIndex};
                           const line6 = {vec:new Vector2D(p5, p0), pathID:tokenID.pathIndex};
                           
                           lines.push(line1, line2, line3, line4, line5, line6);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: p4, id: idPointEnd});
                           anchorPoints.push({pt: p5, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line5.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line6.vec.midP, id: idPointMid});

                        }
                        // tokenPath += `  M ${x0} ${y0 + halfHeight} `;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0}`; 
                        // tokenPath += ` L ${x0 + width} ${y0 + halfHeight}`;
                        // tokenPath += ` L ${x0 + halfWidth} ${y0 + height} Z`;
                     }
                  }
               }
               else if(options.cornerType === "fillet"){
                  
                  if(options.winding === "left"){
                     let arcSide = "0 0";//0 1 - inside small , 1 1 - inside big, 1 0 - castelinho, 0 0 default fillet
                     if(heightV > 0 && widthH > 0){//normal
                        tokenPath += `  M ${x1} ${y0} `;                                                 //      M0------Z-----7 
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1}`;          //     A/              \A
                        tokenPath += ` V ${y2}`;                                                         //     1                6
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y3}`;          //    V|                |
                        tokenPath += ` H ${x2}`;                                                         //     |                |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x3} ${y2}`;          //     2                5
                        tokenPath += ` V ${y1}`;                                                         //     A\              /A
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;        //       3------H-----4

                        //todos pontos dos cantos
                        const p0 = {x:x1 , y: y0};
                        const p1 = {x:x0 , y: y1};
                        const p2 = {x:x0 , y: y2};
                        const p3 = {x:x1 , y: y3};
                        const p4 = {x:x2 , y: y3};
                        const p5 = {x:x3 , y: y2};
                        const p6 = {x:x3 , y: y1};
                        const p7 = {x:x2 , y: y0};
                        
                        //top left
                        let midPointArc0X = x1 + CONSTANTS["topLeftCos"] * filletSize;
                        let midPointArc0Y = y1 + CONSTANTS["topLeftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //bot left
                        let midPointArc1X = x1 + CONSTANTS["botLeftCos"] * filletSize;
                        let midPointArc1Y = y2 + CONSTANTS["botLeftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});

                        //bot right
                        let midPointArc2X = x2 + CONSTANTS["botRightCos"] * filletSize;
                        let midPointArc2Y = y2 + CONSTANTS["botRightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc2X, y: midPointArc2Y}, id: idPointMid});

                        //top right
                        let midPointArc3X = x2 + CONSTANTS["topRightCos"] * filletSize;
                        let midPointArc3Y = y1 + CONSTANTS["topRightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc3X, y: midPointArc3Y}, id: idPointMid});
                        
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p5, p6), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p7, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2, line3, line4);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: p6, id: idPointEnd});
                        anchorPoints.push({pt: p7, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                        
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                        x1 = x0 + filletSize;                                                              //       M0-----Z-----3
                        x2 = x3 - filletSize;                                                              //       /             \
                        tokenPath += `  M ${x1} ${y0} `;                                                   //      /               \
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0 + height}`;   //    A \               / A
                        tokenPath += ` H ${x2}`;                                                           //       \             /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;          //        1-----H-----2

                        //todos pontos dos cantos
                        const p0 = {x:x1 , y: y0};
                        const p1 = {x:x1 , y: y0 + height};
                        const p2 = {x:x2 , y: y0 + height};
                        const p3 = {x:x2 , y: y0};
                        
                        //left
                        let midPointArc0X = x1 + CONSTANTS["leftCos"] * filletSize;
                        let midPointArc0Y = y0 + filletSize + CONSTANTS["leftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //right
                        let midPointArc1X = x2 + CONSTANTS["rightCos"] * filletSize;
                        let midPointArc1Y = y0 + filletSize + CONSTANTS["rightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;                                                         //      /\A
                        y1 = y0 + filletSize;                                                             //     /  \
                        y2 = y3 - filletSize;                                                             //    3    2
                        tokenPath += `  M ${x0} ${y2} `;                                                  //   Z|    |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y2}`;   //   M0    1
                        tokenPath += ` V ${y1}`;                                                          //     \  /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1} Z`;         //      \/A

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y2};
                        const p1 = {x:x0 + width , y: y2};
                        const p2 = {x:x0 + width , y: y1};
                        const p3 = {x:x0 , y: y1};
                        
                        //top
                        let midPointArc0X = x0 + filletSize + CONSTANTS["topCos"] * filletSize;
                        let midPointArc0Y = y1 + CONSTANTS["topSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //bot
                        let midPointArc1X = x0 + filletSize + CONSTANTS["botCos"] * filletSize;
                        let midPointArc1Y = y2 + CONSTANTS["botSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});

                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;                                                         //      /\A
                           y1 = y0 + filletSize;                                                             //     /  \
                           y2 = y3 - filletSize;                                                             //    3    2
                           tokenPath += `  M ${x0} ${y2} `;                                                  //   Z|    |V
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y2}`;   //   M0    1
                           tokenPath += ` V ${y1}`;                                                          //     \  /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y1} Z`;         //      \/A

                           //todos pontos dos cantos
                           const p0 = {x:x0 , y: y2};
                           const p1 = {x:x0 + width , y: y2};
                           const p2 = {x:x0 + width , y: y1};
                           const p3 = {x:x0 , y: y1};
                           
                           //top
                           let midPointArc0X = x0 + filletSize + CONSTANTS["topCos"] * filletSize;
                           let midPointArc0Y = y1 + CONSTANTS["topSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                           
                           //bot
                           let midPointArc1X = x0 + filletSize + CONSTANTS["botCos"] * filletSize;
                           let midPointArc1Y = y2 + CONSTANTS["botSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                   
                           const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                           lines.push(line1, line2);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        }
                        else{
                           filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                           x1 = x0 + filletSize;                                                              //       M0-----Z-----3
                           x2 = x3 - filletSize;                                                              //       /             \
                           tokenPath += `  M ${x1} ${y0} `;                                                   //      /               \
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0 + height}`;   //    A \               / A
                           tokenPath += ` H ${x2}`;                                                           //       \             /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0} Z`;          //        1-----H-----2

                           //todos pontos dos cantos
                           const p0 = {x:x1 , y: y0};
                           const p1 = {x:x1 , y: y0 + height};
                           const p2 = {x:x2 , y: y0 + height};
                           const p3 = {x:x2 , y: y0};
                           
                           //left
                           let midPointArc0X = x1 + CONSTANTS["leftCos"] * filletSize;
                           let midPointArc0Y = y0 + filletSize + CONSTANTS["leftSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                           
                           //right
                           let midPointArc1X = x2 + CONSTANTS["rightCos"] * filletSize;
                           let midPointArc1Y = y0 + filletSize + CONSTANTS["rightSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                   
                           const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                           lines.push(line1, line2);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        }
                     }
                  }
                  else{//WINDING RIGHT
                     let arcSide = "0 1";
                     if(heightV > 0 && widthH > 0){//normal
                        tokenPath += `  M ${x0} ${y1} `;                                                 //       1-----H-----2 
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;          //     A/             \A
                        tokenPath += ` H ${x2}`;                                                         //    M0               3
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x3} ${y1}`;          //     |               |
                        tokenPath += ` V ${y2}`;                                                         //    Z|               |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y3}`;          //     7               4
                        tokenPath += ` H ${x1}`;                                                         //     A\             /A
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;        //       6-----H-----5

                        //todos pontos dos cantos
                        const p0 = {x:x1 , y: y0};
                        const p1 = {x:x0 , y: y1};
                        const p2 = {x:x0 , y: y2};
                        const p3 = {x:x1 , y: y3};
                        const p4 = {x:x2 , y: y3};
                        const p5 = {x:x3 , y: y2};
                        const p6 = {x:x3 , y: y1};
                        const p7 = {x:x2 , y: y0};
                        
                        //top left
                        let midPointArc0X = x1 + CONSTANTS["topLeftCos"] * filletSize;
                        let midPointArc0Y = y1 + CONSTANTS["topLeftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //bot left
                        let midPointArc1X = x1 + CONSTANTS["botLeftCos"] * filletSize;
                        let midPointArc1Y = y2 + CONSTANTS["botLeftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});

                        //bot right
                        let midPointArc2X = x2 + CONSTANTS["botRightCos"] * filletSize;
                        let midPointArc2Y = y2 + CONSTANTS["botRightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc2X, y: midPointArc2Y}, id: idPointMid});

                        //top right
                        let midPointArc3X = x2 + CONSTANTS["topRightCos"] * filletSize;
                        let midPointArc3Y = y1 + CONSTANTS["topRightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc3X, y: midPointArc3Y}, id: idPointMid});
                        
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p4), pathID:tokenID.pathIndex};
                        const line3 = {vec:new Vector2D(p5, p6), pathID:tokenID.pathIndex};
                        const line4 = {vec:new Vector2D(p7, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2, line3, line4);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: p4, id: idPointEnd});
                        anchorPoints.push({pt: p5, id: idPointEnd});
                        anchorPoints.push({pt: p6, id: idPointEnd});
                        anchorPoints.push({pt: p7, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line3.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line4.vec.midP, id: idPointMid});
                     }
                     else if(heightV <= 0 && widthH > 0){//horizontal
                        filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                        x1 = x0 + filletSize;                                                             //        1-----Z-----2
                        x2 = x3 - filletSize;                                                             //       /             \
                        tokenPath += `  M ${x1} ${y0 + height} `;                                         //      /               \
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;           //    A \               / A
                        tokenPath += ` H ${x2}`;                                                          //       \             /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0+height} Z`;  //       M0-----H-----3

                        //todos pontos dos cantos
                        const p0 = {x:x1 , y: y0};
                        const p1 = {x:x1 , y: y0 + height};
                        const p2 = {x:x2 , y: y0 + height};
                        const p3 = {x:x2 , y: y0};
                        
                        //left
                        let midPointArc0X = x1 + CONSTANTS["leftCos"] * filletSize;
                        let midPointArc0Y = y0 + filletSize + CONSTANTS["leftSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //right
                        let midPointArc1X = x2 + CONSTANTS["rightCos"] * filletSize;
                        let midPointArc1Y = y0 + filletSize + CONSTANTS["rightSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                     }
                     else if(widthH <= 0 && heightV > 0){//vertical
                        filletSize = width * 0.5;                                                         //      /\A
                        y1 = y0 + filletSize;                                                             //     /  \
                        y2 = y3 - filletSize;                                                             //   M0    1
                        tokenPath += `  M ${x0} ${y1} `;                                                  //   Z|    |V
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y1}`;   //    3    2
                        tokenPath += ` V ${y2}`;                                                          //     \  /
                        tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;         //      \/A

                        //todos pontos dos cantos
                        const p0 = {x:x0 , y: y2};
                        const p1 = {x:x0 + width , y: y2};
                        const p2 = {x:x0 + width , y: y1};
                        const p3 = {x:x0 , y: y1};
                        
                        //top
                        let midPointArc0X = x0 + filletSize + CONSTANTS["topCos"] * filletSize;
                        let midPointArc0Y = y1 + CONSTANTS["topSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                        
                        //bot
                        let midPointArc1X = x0 + filletSize + CONSTANTS["botCos"] * filletSize;
                        let midPointArc1Y = y2 + CONSTANTS["botSin"] * filletSize;
                        anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                
                        const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                        const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                        lines.push(line1, line2);
                        
                        anchorPoints.push({pt: p0, id: idPointEnd});
                        anchorPoints.push({pt: p1, id: idPointEnd});
                        anchorPoints.push({pt: p2, id: idPointEnd});
                        anchorPoints.push({pt: p3, id: idPointEnd});
                        anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                        anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                     }
                     else if(widthH <= 0 && heightV <= 0){//horizontal e vertical
                        if(Math.abs(widthH) > Math.abs(heightV)){
                           filletSize = width * 0.5;                                                         //      /\A
                           y1 = y0 + filletSize;                                                             //     /  \
                           y2 = y3 - filletSize;                                                             //   M0    1
                           tokenPath += `  M ${x0} ${y1} `;                                                  //   Z|    |V
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0 + width} ${y1}`;   //    3    2
                           tokenPath += ` V ${y2}`;                                                          //     \  /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x0} ${y2} Z`;         //      \/A

                           //todos pontos dos cantos
                           const p0 = {x:x0 , y: y2};
                           const p1 = {x:x0 + width , y: y2};
                           const p2 = {x:x0 + width , y: y1};
                           const p3 = {x:x0 , y: y1};
                           
                           //top
                           let midPointArc0X = x0 + filletSize + CONSTANTS["topCos"] * filletSize;
                           let midPointArc0Y = y1 + CONSTANTS["topSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                           
                           //bot
                           let midPointArc1X = x0 + filletSize + CONSTANTS["botCos"] * filletSize;
                           let midPointArc1Y = y2 + CONSTANTS["botSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                   
                           const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                           lines.push(line1, line2);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        }
                        else{
                           filletSize = height * 0.5;//se tirar esse aqui, ele fica mais troncudo***
                           x1 = x0 + filletSize;                                                             //        1-----Z-----2
                           x2 = x3 - filletSize;                                                             //       /             \
                           tokenPath += `  M ${x1} ${y0 + height} `;                                         //      /               \
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x1} ${y0}`;           //    A \               / A
                           tokenPath += ` H ${x2}`;                                                          //       \             /
                           tokenPath += ` A ${filletSize} ${filletSize} 0 ${arcSide} ${x2} ${y0+height} Z`;  //       M0-----H-----3

                           //todos pontos dos cantos
                           const p0 = {x:x1 , y: y0};
                           const p1 = {x:x1 , y: y0 + height};
                           const p2 = {x:x2 , y: y0 + height};
                           const p3 = {x:x2 , y: y0};
                           
                           //left
                           let midPointArc0X = x1 + CONSTANTS["leftCos"] * filletSize;
                           let midPointArc0Y = y0 + filletSize + CONSTANTS["leftSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc0X, y: midPointArc0Y}, id: idPointMid});
                           
                           //right
                           let midPointArc1X = x2 + CONSTANTS["rightCos"] * filletSize;
                           let midPointArc1Y = y0 + filletSize + CONSTANTS["rightSin"] * filletSize;
                           anchorPoints.push({pt: {x: midPointArc1X, y: midPointArc1Y}, id: idPointMid});
                                                   
                           const line1 = {vec:new Vector2D(p1, p2), pathID:tokenID.pathIndex};
                           const line2 = {vec:new Vector2D(p3, p0), pathID:tokenID.pathIndex};
                           lines.push(line1, line2);
                           
                           anchorPoints.push({pt: p0, id: idPointEnd});
                           anchorPoints.push({pt: p1, id: idPointEnd});
                           anchorPoints.push({pt: p2, id: idPointEnd});
                           anchorPoints.push({pt: p3, id: idPointEnd});
                           anchorPoints.push({pt: line1.vec.midP, id: idPointMid});
                           anchorPoints.push({pt: line2.vec.midP, id: idPointMid});
                        }
                     }
                  }
               }
            }
         }
            
      }


      return tokenPath;
   },

   removeDuplicateCommands(pathString){
      //remover duplicate M commands pra fazer o fill ser mais correto*
      let parts = pathString.trimStart().split(' ');
      let indexesToRemove = [];
      for(let i  = 0; i < parts.length; i++){
         if(parts[i]=== "M"){
            
            let before1 = parts[i - 1];
            let after1 = parts[i + 2];

            let before2 = parts[i - 2];
            let after2 = parts[i + 1];
            
            let valor1 = after1 - before1;
            let valor2 = after2 - before2;
            if(Math.abs(valor1) < 0.0001 && Math.abs(valor2) < 0.0001){
               indexesToRemove.push(i);
            }
         }
      }

      //retira do final pro inicial pra nao alterar os indexes do remove
      for(let i  = indexesToRemove.length - 1; i >= 0; i--){
         parts.splice(indexesToRemove[i], 3);
      }
      
      let finalTokenPath = parts.toString();
      finalTokenPath = finalTokenPath.replaceAll(',' , ' ');
      return finalTokenPath;
   },

   buildLastArcPoint(token, mousePoint){
      
      let pontoA = token.pontos[0];
      let pontoB = token.pontos[1];
      //let mousePoint = mousePoint;
      
      let vec = new Vector2D(pontoA, pontoB);
      let vecMouse = new Vector2D(pontoA, mousePoint);
      let arcRadius = vec.getLenght();
      
      let normalVec = new Vector2D(pontoA, {x:pontoA.x + vec.ln.x , y: pontoA.y + vec.ln.y});
      let normalVecMouse = new Vector2D(pontoA, {x:pontoA.x + vecMouse.ln.x , y: pontoA.y + vecMouse.ln.y});
      
      let dotNormals = dotProduct(normalVec, vecMouse);
      let cosTheta = dotProduct(vec, vecMouse) / (vec.getLenght() * vecMouse.getLenght());
      let angleRad = Math.acos(cosTheta);
      let angle = window.utils.RadToDeg(angleRad); //works //0 a 180, quero de 0 a 360...
      
      let eixoX = new Vector2D({x:0,y:0}, {x:1,y:0});
      let eixoXNormal = new Vector2D({x:0,y:0}, {x:0,y:-1});
      let dotNormalsEixoX = dotProduct(vec, eixoXNormal);
      let cosOffset = dotProduct(vec, eixoX) / (vec.getLenght() * eixoX.getLenght());
      let angleOffSetRad = Math.acos(cosOffset);
      let angleOffdegree = window.utils.RadToDeg(angleOffSetRad); //works //0 a 180, quero de 0 a 360...
      if(dotNormalsEixoX < 0){
         angleOffdegree = (180 - angleOffdegree) + 180;
      }
      
      if(dotNormals < 0){
         angle = (180 - angle) + 180;
      }

      angle += angleOffdegree;
      //let finalPosX = mousePoint.x;//16;//mousePoint.x
      //let finalPosY = mousePoint.y;//24;//mousePoint.y

      let finalAngleRad = window.utils.DegToRad(angle);
      let finalPosX = pontoA.x + Math.cos(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
      let finalPosY = pontoA.y - Math.sin(finalAngleRad) * arcRadius;//se quizer fazer o arc que nem o cad...circular
      return {x: finalPosX, y: finalPosY};
      
   },

}

const buildCirclePath=(cx, cy, raio, opt)=>{
   let circleSide = "1 0";
   let sinal = 1;
   if(opt.winding === "right"){
      circleSide = "0 1";
      sinal = -1;
   }
   //relative
   // let circlePath_relative = ` M ${cx} ${cy}
   //    m -${raio} 0
   //    a ${raio} ${raio} 0 ${circleSide} ${raio * 2} 0
   //    a ${raio} ${raio} 0 ${circleSide} ${raio * -2} 0`;
   //absolute
   // let circlePath_Absolute = ` M ${cx - raio} ${cy}
   //    A ${raio} ${raio} 0 ${circleSide} ${cx + raio} ${cy}
   //    A ${raio} ${raio} 0 ${circleSide} ${cx - raio} ${cy}`;

   let circlePath_Absolute = ` M ${cx + (-1 * sinal * raio)} ${cy}
      A ${raio} ${raio} 0 ${circleSide} ${cx + (sinal * raio)} ${cy}
      A ${raio} ${raio} 0 ${circleSide} ${cx + (-1 * sinal * raio)} ${cy}`;
   
   return circlePath_Absolute;
}


export const buildPathObjects=(pathArray)=>{
   let paths = [];
   //build path objects
   for(let i =0; i < pathArray.length; i++){
      let pathItem = pathArray[i];
      if(pathItem.visible === true){
         let path_d_string = "";
         for(let k = 0; k < pathItem.tokenList.length; k++){
            path_d_string += TokenHelper.convertTokenToPath(pathItem.tokenList[k]);
         }
         //let final_d_Path = TokenHelper.removeDuplicateCommands(path_d_string);
         let final_d_Path = path_d_string;
         let pathObject = <path drawing={pathItem.pathName} strokeWidth={pathItem.strokeWidth}  strokeLinecap={pathItem.strokeLineCap} strokeLinejoin={pathItem.strokeLinejoin} 
            stroke={pathItem.strokeColor}
            vectorEffect={pathItem.vectorEffect}
            strokeDasharray={pathItem.strokeDasharray}
            fill={pathItem.usePathFill ? pathItem.pathFillColor : "none"}//"none" ou cor
            d={final_d_Path}
            key={crypto.randomUUID()}
         />
         paths.push(pathObject);
      }
   }
   return paths;
}



export const BuildSvgString=(viewBoxWidth, viewBoxHeight, svgPaths)=>{
      
   // se inclui o  cursor="pointer"> no <svg>
   // como fica o height e width do svg ? botar alguma coisa pra ser wrapped ? tipo ao inves deo valor ser 100% ??
   let objectString = {};
   //react
   let fullSvgPathReact = `<svg width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">\n` //>\n
   let svgHeaderReact = `<svg width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">`
   let svgBodyReact = [];
   //html
   let fullSvgPathHtml = `<svg width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">\n` //>\n
   let svgHeaderHtml = `<svg width="${viewBoxWidth}" height="${viewBoxHeight}" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}">`
   let svgBodyHtml = [];

   let endSvg = `</svg>`;

   //build path objects
   for(let i = 0; i < svgPaths.length; i++){
      let pathStringReact = "";
      let pathStringHtml = "";
      let pathItem = svgPaths[i];
      if(pathItem.visible === true){
         const strokeWidthString = (pathItem.strokeWidth != 1 ? `strokeWidth="${pathItem.strokeWidth}" ` : "");
         const strokeString = `stroke="${pathItem.strokeColor}" `;
         const strokeLinecapString = (pathItem.strokeLineCap != "butt" ? `strokeLinecap="${pathItem.strokeLineCap}" ` : "");
         const strokeLinejoinString = (pathItem.strokeLinejoin != "miter" ? `strokeLinejoin="${pathItem.strokeLinejoin}" ` : "");
         const fillString = (pathItem.usePathFill != false ? `fill="${pathItem.pathFillColor}" ` : `fill="none" `);
         const vectorEffectString = (pathItem.vectorEffect != "none" ? `vectorEffect="${pathItem.vectorEffect}" ` : "");
         const strokeDasharrayString = (pathItem.strokeDasharray != "none" ? `strokeDasharray="${pathItem.strokeDasharray}" ` : "");
         pathStringReact += `\t<path ${strokeWidthString}${strokeString}${strokeLinecapString}${strokeLinejoinString}${fillString}${vectorEffectString}${strokeDasharrayString}d="`
         
         const a = (pathItem.strokeWidth != 1 ? `stroke-width="${pathItem.strokeWidth}" ` : "");
         const b = `stroke="${pathItem.strokeColor}" `;
         const c = (pathItem.strokeLineCap != "butt" ? `stroke-linecap="${pathItem.strokeLineCap}" ` : "");
         const d = (pathItem.strokeLinejoin != "miter" ? `stroke-linejoin="${pathItem.strokeLinejoin}" ` : "");
         const e = (pathItem.usePathFill != false ? `fill="${pathItem.pathFillColor}" ` : `fill="none" `);
         const f = (pathItem.vectorEffect != "none" ? `vector-effect="${pathItem.vectorEffect}" ` : "");
         const g = (pathItem.strokeDasharray != "none" ? `stroke-dasharray="${pathItem.strokeDasharray}" ` : "");

         pathStringHtml += `\t<path ${a}${b}${c}${d}${e}${f}${g}d="`
         

         let d_string = "";
         for(let k = 0; k < pathItem.tokenList.length; k++){
            d_string += TokenHelper.convertTokenToPath(pathItem.tokenList[k]);
         }
         let final_D_Path = TokenHelper.removeDuplicateCommands(d_string);
         pathStringReact += final_D_Path + `" />\n`;
         pathStringHtml += final_D_Path + `" />\n`;

         if(pathItem.tokenList.length > 0){//so adiciona o path se tiver coisa no layer
            fullSvgPathReact += pathStringReact;
            svgBodyReact.push(pathStringReact);

            fullSvgPathHtml += pathStringHtml;
            svgBodyHtml.push(pathStringHtml);
         }

      }
   }

   fullSvgPathReact += `</svg>`;
   fullSvgPathHtml += `</svg>`;

   objectString.reactString = fullSvgPathReact;
   objectString.svgHeaderReact = svgHeaderReact;
   objectString.svgBodyReact = svgBodyReact;
   objectString.htmlString = fullSvgPathHtml;
   objectString.svgHeaderHtml = svgHeaderHtml;
   objectString.svgBodyHtml = svgBodyHtml;
   objectString.endSvg = endSvg;
   
   return objectString;

}
