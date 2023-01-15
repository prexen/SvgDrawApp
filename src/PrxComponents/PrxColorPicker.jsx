import {Component, createRef} from 'react';

import PrxSpinner from './PrxSpinner';

class PrxColorPicker extends Component{
   static defaultProps = {
      
   }
   constructor(props){
      super(props)
      this.state={
         posX: 100,
         posY: 0,

         hsv:{
            h:0,
            s:1,
            v:1,
         },
         rgb:{
            r:127,
            g:127,
            b:127,
         },
         alpha: 0,
         
         hexColor:"ffffff",
         Hbar_DisplayMark: 0,
         barra_S: "rgb(255,0,0)",//barra do quadroHV
         barra_V: "rgb(255,0,0)",//barra do quadroHS
         quadro_SV: "rgb(255,0,0)",//quadro da barra do H

         radioSelect: "H",
         corString: "",
      }

      this.tempHexInput = "";
      
      this.colorSpaceRadio = {
         H: createRef(),//display name, ref, valueInterno
         S: createRef(),
         V: createRef(),
      }
   }

   componentDidMount=()=>{
      
      let rgba = this.convertInputToValues(this.props.valor);
      let hsv = this.RGBtoHSV(rgba)//par objto rgb:{r,g,b}
      let hex = this.RGBtoHEX(rgba);
      
      let rgb = this.HSVtoRBG(hsv);
      let barra_V = this.convertRGBtoString(rgba);
      let barra_S = this.convertRGBtoString(rgba);
      let quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h ,s:100, v:100}));

      //posicao da window - pode vir de props
      let posX = 0;
      let posY = 0;
      if(this.props.posX === undefined){
         posX = (window.innerWidth / 2) - 199;//398 width
         posY = (window.innerHeight / 2) - 190;//380 height
      }
      else{
         posX = this.props.posX;
         posY = this.props.posY;
      }
      

      this.setState({hsv: hsv, rgb: rgba,
          quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V,
           hexColor:hex, alpha: rgba.a, Hbar_DisplayMark: hsv.h, corString: this.props.valor,
           posX: posX, posY:posY,
         });
   
   }


   finishEditing=(e)=>{
      let edit = e.currentTarget.getAttribute("data-edit");
      let objResult = this.buildResultEvent();
      if(edit === "confirm"){
         this.props.updateColor(objResult);
      }
      else{
         objResult.value = this.props.valor;
         this.props.updateColor(objResult);
      }
   }
   
   buildResultEvent=(parValue)=>{  
      let value = "#"+this.state.hexColor;
      return {name:this.props.name, value: value}
   }


   
   //funcao que seta tudo no "open" da window
   convertInputToValues=(colorStr)=>{
      let r = 255;
      let g = 255;
      let b = 255;
      let a = 100;
      let first = colorStr.replaceAll(' ', "");
      if(colorStr.includes("rgb")){
         //rgb ou rgba
         let second = first.replace('rgb', "");
         let third = second.replace('a', "");
         let fourth = third.replace('(', "");
         let fifth = fourth.replace(')', "");
         let arr = fifth.split(',');
         r = Number(arr[0]);
         g = Number(arr[1]);
         b = Number(arr[2]);
         a = Number(arr[3]);
         a = Math.round(a * 100);//converter o valor de 0 a 1 pra 0 a 100
         if(isNaN(a)){
            a = 100;
         }
      }
      else if(colorStr.includes("#")){
         let second = first.replace('#', "");

         let rHex = second.slice(0, 2);
         let gHex = second.slice(2, 4);
         let bHex = second.slice(4, 6);
         r = parseInt(rHex, 16);
         g = parseInt(gHex, 16);
         b = parseInt(bHex, 16);
         a = 100;
         if(second.length === 8){
            //nao tem alfa
            let aHex = second.slice(6, 8);
            let aInt = parseInt(aHex, 16);//0 a 255
            a = Math.round((aInt / 255) * 100); //preciso conveter esse valor pra 0 a 100
         }
      }
      return {r,g,b,a};
      
   }


   
   convertRGBtoString=(rgbOBJ)=>{
      if(rgbOBJ.a === undefined || rgbOBJ.a === 100){
         return "rgba(" + rgbOBJ.r + "," + rgbOBJ.g + "," + rgbOBJ.b + ")";
      }
      else{
         return "rgba(" + rgbOBJ.r + "," + rgbOBJ.g + "," + rgbOBJ.b + "," + (rgbOBJ.a / 100) + ")";
      }
   }
   
   RGBtoHEX(objRGB){
      let rHex = objRGB.r.toString(16).toUpperCase();
      if(rHex.length === 1){
         rHex = "0" + rHex;
      }
      let gHex = objRGB.g.toString(16).toUpperCase();
      if(gHex.length === 1){
         gHex = "0" + gHex;
      }
      let bHex = objRGB.b.toString(16).toUpperCase();
      if(bHex.length === 1){
         bHex = "0" + bHex;
      }
      let alphaHex = "";
      if(objRGB.a < 100){
         let alfaNum = Math.round(objRGB.a / 100 * 256);
         alphaHex = alfaNum.toString(16).toUpperCase();
         if(alphaHex.length === 1){
            alphaHex = "0" + alphaHex;
         }
      }
      return rHex + gHex + bHex + alphaHex;
   }
   
   //#region field inputs H S V , R G B, A - radio buttons
   selectColorSpaceSimple=(e)=>{
      let spaceSelected = e.target.getAttribute("data-index");//H / S / V
      if(spaceSelected != this.state.radioSelect){
         this.setState({radioSelect: spaceSelected});
      }
   }

   HandleBarClick=(e)=>{
      if(e.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         let barType = e.currentTarget.getAttribute("data-bar");
         const rectX = e.currentTarget.getBoundingClientRect().x;
         let posX = e.clientX - rectX;
         let barValueClick = window.utils.ClampNumber(posX / 256, 0, 1);
         
         let newHSV = this.state.hsv;
         let barra_V = this.state.barra_V;
         let barra_S = this.state.barra_S;
         let Hbar_DisplayMark = newHSV.h
         if(barType === "H"){//converter o valor pra um H
            let h = Math.round(barValueClick * 360);//ou 360 ?
            Hbar_DisplayMark = h;
            if(h === 360){
               h = 0;
               Hbar_DisplayMark = 360;
            } 
            barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
            barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
            newHSV.h = h;
         }
         else if(barType === "S"){//converter o valor pra um S
            let s = Math.round(barValueClick * 100);
            barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:s, v:100}));
            newHSV.s = s;
         }
         else if(barType === "V"){//converter o valor pra um V
            let v = Math.round(barValueClick * 100);
            barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:v}));
            newHSV.v = v;
         }
         
         let rgb = this.HSVtoRBG(newHSV);
         let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
         let quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:100, v:100}));//this.HSVtoRBG(hue, 1, 1);
         let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
         this.setState({hsv: newHSV, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor: hex, Hbar_DisplayMark:Hbar_DisplayMark, corString:corString});

         const barMouseMove = (e) => {
            posX = e.clientX - rectX;
            barValueClick = window.utils.ClampNumber(posX / 256, 0, 1);
            
            newHSV = this.state.hsv;
            Hbar_DisplayMark = newHSV.h;
            if(barType === "H"){//converter o valor pra um H
               let h = Math.round(barValueClick * 360);//ou 360 ?
               if(h === 360){
                  h = 0;
                  Hbar_DisplayMark = 360;
               }
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
               newHSV.h = h;
            }
            else if(barType === "S"){//converter o valor pra um S
               let s = Math.round(barValueClick * 100);
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:s, v:100}));
               newHSV.s = s;
            }
            else if(barType === "V"){//converter o valor pra um V
               let v = Math.round(barValueClick * 100);
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:v}));
               newHSV.v = v;
            }
            
            rgb = this.HSVtoRBG(newHSV);
            quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:100, v:100}));//this.HSVtoRBG(hue, 1, 1);
            hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
            corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
            this.setState({hsv: newHSV, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor: hex, Hbar_DisplayMark: Hbar_DisplayMark, corString:corString});
         }
         const barMoveEnd = (e) => {
            document.removeEventListener('mousemove', barMouseMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            document.removeEventListener('mouseup', barMoveEnd);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }
   
         document.addEventListener('mousemove', barMouseMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
         document.addEventListener('mouseup', barMoveEnd);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento

      }
      

   }

   HandleBoardClick=(e)=>{
      if(e.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         let boardType = e.currentTarget.getAttribute("data-board");
         const rect = e.currentTarget.getBoundingClientRect();
         let posX = e.clientX - rect.x;
         let posY = e.clientY - rect.y;
         let horValue = window.utils.ClampNumber(posX / 256, 0, 1);
         let vertValue = 1 - window.utils.ClampNumber(posY / 256, 0, 1);
         let newHSV = this.state.hsv;
         let barra_V = this.state.barra_V;
         let barra_S = this.state.barra_S;
         let Hbar_DisplayMark = newHSV.h;
         if(boardType === "SV"){
            let s = Math.round(horValue * 100);
            let v = Math.round(vertValue * 100);
            newHSV.s = s;
            newHSV.v = v;
            barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
            barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
         }
         else if(boardType === "HV"){
            let h = Math.round(horValue * 360);//ou 360 ?
            let v = Math.round(vertValue * 100);
            Hbar_DisplayMark = h;
            if(h === 360){
               h = 0;
            }
            newHSV.h = h;
            newHSV.v = v;
            barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
            barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
         }
         else if(boardType === "HS"){
            let h = Math.round(horValue * 360);//ou 360 ?
            let s = Math.round(vertValue * 100);
            Hbar_DisplayMark = h;
            if(h === 360){
               h = 0;
            }
            newHSV.h = h;
            newHSV.s = s;
            barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
            barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
         }
         
         let rgb = this.HSVtoRBG(newHSV);
         let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
         let quadroSV = this.state.quadro_SV;//this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:100, v:100}));
         let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
         this.setState({hsv: newHSV, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor: hex, Hbar_DisplayMark: Hbar_DisplayMark, corString:corString});

         const boardMouseMove = (e) => {
            posX = e.clientX - rect.x;
            posY = e.clientY - rect.y;
            horValue = window.utils.ClampNumber(posX / 256, 0, 1);
            vertValue = 1 - window.utils.ClampNumber(posY / 256, 0, 1);
            newHSV = this.state.hsv;
            Hbar_DisplayMark = newHSV.h;
            if(boardType === "SV"){
               let s = Math.round(horValue * 100);
               let v = Math.round(vertValue * 100);
               newHSV.s = s;
               newHSV.v = v;
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
            }
            else if(boardType === "HV"){
               let h = Math.round(horValue * 360);//ou 360 ?
               let v = Math.round(vertValue * 100);
               Hbar_DisplayMark = h;
               if(h === 360){
                  h = 0;
                  //Hbar_DisplayMark = 0;
               }
               newHSV.h = h;
               newHSV.v = v;
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
            }
            else if(boardType === "HS"){
               let h = Math.round(horValue * 360);//ou 360 ?
               let s = Math.round(vertValue * 100);
               Hbar_DisplayMark = h;
               if(h === 360){
                  h = 0;
               }
               newHSV.h = h;
               newHSV.s = s;
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:100}));
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:100, v:newHSV.v}));
            }
            rgb = this.HSVtoRBG(newHSV);
            hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
            quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:100, v:100}));
            corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
            this.setState({hsv: newHSV, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor: hex, Hbar_DisplayMark: Hbar_DisplayMark, corString:corString});
         }
         const boardEndMove = (e) => {
            document.removeEventListener('mousemove', boardMouseMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            document.removeEventListener('mouseup', boardEndMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
         }
   
         document.addEventListener('mousemove', boardMouseMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
         document.addEventListener('mouseup', boardEndMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento


      }
      
      
   }
   
   updateControlHSV=(obj)=>{
      let newHSV = this.state.hsv;
      newHSV[obj.name] = obj.value;
      let barra_V = this.state.barra_V;
      let barra_S = this.state.barra_S;
      if(obj.name === "h"){//converter o valor pra um H
         let h = newHSV.h;
         barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
         barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:newHSV.v}));
         newHSV.h = h;
      }
      else if(obj.name === "s"){//converter o valor pra um S
         let s = newHSV.s;
         barra_V = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:s, v:100}));
         newHSV.s = s;
      }
      else if(obj.name === "v"){//converter o valor pra um V
         let v = newHSV.v;
         barra_S = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h , s:newHSV.s, v:v}));
         newHSV.v = v;
      }
      
      let rgb = this.HSVtoRBG(newHSV);
      let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
      let quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:newHSV.h ,s:100, v:100}));//this.HSVtoRBG(hue, 1, 1);
      let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
      this.setState({hsv: newHSV, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor: hex, corString:corString});
      
   }

   updateControlRGB=(obj)=>{
      let rgb = this.state.rgb;
      rgb[obj.name] = obj.value;
      
      let hsv = this.RGBtoHSV(rgb);
      let Hbar_DisplayMark = hsv.h;
      let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
      let barra_V = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h , s:hsv.s, v:100}));
      let barra_S = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h , s:100, v:hsv.v}));
      if(rgb.g === 255){
         if(rgb.r === 255){
            if(rgb.b === 255){
               barra_V = this.convertRGBtoString(this.HSVtoRBG({h:0 , s:hsv.s, v:100}));
               barra_S = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h , s:100, v:hsv.v}));
            }
         }
      }
      
      let quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h ,s:100, v:100}));//this.HSVtoRBG(hue, 1, 1);
      let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
      this.setState({hsv: hsv, rgb: rgb, quadro_SV: quadroSV, barra_S: barra_S, barra_V: barra_V, hexColor:hex, Hbar_DisplayMark:Hbar_DisplayMark, corString:corString});
   }

   HandleAlfaBarClick=(e)=>{
      if(e.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         const rectX = e.currentTarget.getBoundingClientRect().x;
         let posX = e.clientX - rectX;
         let barValueClick = window.utils.ClampNumber(posX / 254, 0, 1);
         let alpha = Math.round(barValueClick * 100);
         const rgb = this.state.rgb;
         let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
         let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
         this.setState({alpha: alpha, hexColor: hex, corString:corString});
         const alfaBarMove = (e) => {
            posX = e.clientX - rectX;
            barValueClick = window.utils.ClampNumber(posX / 254, 0, 1);
            alpha = Math.round(barValueClick * 100);
            corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
            hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
            this.setState({alpha: alpha, hexColor: hex, corString:corString});
         }
         const endAlfaBarMove = (e) => {
            
            document.removeEventListener('mousemove', alfaBarMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            document.removeEventListener('mouseup', endAlfaBarMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
            
         }
   
         document.addEventListener('mousemove', alfaBarMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
         document.addEventListener('mouseup', endAlfaBarMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
      }
   
   }
   
   updateControlAlpha=(obj)=>{
      let alpha = obj.value;
      let rgb = this.state.rgb;
      let hex = this.RGBtoHEX({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
      let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:alpha});
      this.setState({alpha: alpha, hexColor: hex, corString:corString});
      
   }
   
   //#endregion
   

   //#region Input field hexcolor
   HEXtoRGB=(hexCode)=>{
      let r = 0, g = 0, b = 0, a = -1;
      if(hexCode.length === 6){//sem alpha
         let rHex = hexCode.slice(0, 2);
         let gHex = hexCode.slice(2, 4);
         let bHex = hexCode.slice(4, 6);
         r = parseInt(rHex, 16);
         g = parseInt(gHex, 16);
         b = parseInt(bHex, 16);
      }
      else if(hexCode.length === 8){
         let rHex = hexCode.slice(0, 2);
         let gHex = hexCode.slice(2, 4);
         let bHex = hexCode.slice(4, 6);
         let aHex = hexCode.slice(6, 8);
         r = parseInt(rHex, 16);
         g = parseInt(gHex, 16);
         b = parseInt(bHex, 16);
         a = parseInt(aHex, 16);
      }
      return {r: r, g: g, b: b, a:a}
   }

   ValidadeHEX=(hexCode)=>{
      if(hexCode.length === 6 || hexCode.length === 8){
         const possibleChars = "0123456789ABCDEF";
         hexCode = hexCode.toUpperCase();
         for(let i = 0 ; i < hexCode.length; i++){
            if(!possibleChars.includes(hexCode[i])){
               return false;//failed
            }
         }
         return true;//tem size adequado, tem characters validos
      }
      return false;//failed
   }

   hexInputChange=(e)=>{
      if(e.target.value.length <= 8){//maximo 8 chars
         this.setState({hexColor: e.target.value});
      }
   }

   onFocusHex=(e)=>{
      this.tempHexInput = this.state.hexColor;
      this.lostFocusByKey = false;
   }

   onBlurHex=(e)=>{
      if(this.lostFocusByKey === false){//se perdeu o focus com mouse
         if(this.ValidadeHEX(this.state.hexColor)){
            //valido
            this.updateStateForHEXinput();

         }
         else{
            //invalido   
            this.setState({hexColor: this.tempHexInput});
         }
      }
   }

   hexInputKeyDown=(e)=>{
      if(e.key === "Escape"){
         this.lostFocusByKey = true;
         //let target = e.currentTarget;
         this.setState({hexColor: this.tempHexInput});//, ()=> target.blur());
         e.currentTarget.blur();
      }
      else if(e.key === "Enter"){
         this.lostFocusByKey = true;
         //let target = e.currentTarget;
         if(this.ValidadeHEX(this.state.hexColor)){
            //valido
            this.updateStateForHEXinput();
         }
         else{
            //invalido   
            this.setState({hexColor: this.tempHexInput});//, ()=> target.blur());
         }
         e.currentTarget.blur();
      }
   }

   updateStateForHEXinput=()=>{
      let hex = this.state.hexColor.toUpperCase();
      let rgba = this.HEXtoRGB(this.state.hexColor);
      let alpha = this.state.alpha;
      if(rgba.a != -1){
         alpha = Math.round((rgba.a / 256) * 100);
      }
      
      let rgb = {r:rgba.r, g:rgba.g, b:rgba.b};
      let hsv = this.RGBtoHSV(rgb);
      let Hbar_DisplayMark = hsv.h;
      let barra_V = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h , s:hsv.s, v:100}));
      let barra_S = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h , s:100, v:hsv.v}));
      let quadroSV = this.convertRGBtoString(this.HSVtoRBG({h:hsv.h ,s:100, v:100}));//this.HSVtoRBG(hue, 1, 1);
      let corString = this.convertRGBtoString({r:rgb.r, g:rgb.g, b:rgb.b, a:this.state.alpha});
      this.setState({rgb: rgb, hsv:hsv, barra_S: barra_S, barra_V: barra_V, quadro_SV: quadroSV, Hbar_DisplayMark:Hbar_DisplayMark, corString:corString, alpha:alpha, hexColor:hex});
   }
   //#endregion

   

   WindowMoveStart=(e)=>{
      if(e.target != e.currentTarget) return;
      if(e.button === 0){//0 esquerda | 1 eh wheel | 2 direita
         const startPosX = this.state.posX;
         const startPosY = this.state.posY;
         let mouseStartX = e.clientX;
         let mouseStartY = e.clientY;
         const startTime = Date.now();
         const PickerMove = (e) => {
            let deltaX = e.clientX - mouseStartX;
            let deltaY = e.clientY - mouseStartY;
            let finalX = startPosX + deltaX;
            let finalY = startPosY + deltaY;
            this.setState({posX: finalX, posY:finalY});
         }
         const endPickerMove = (e) => {
            const deltaTime = Date.now() - startTime;
            if(deltaTime < 120){
               //um click por exemplo
            }
            document.removeEventListener('mousemove', PickerMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            document.removeEventListener('mouseup', endPickerMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
            if (!this._isMouseDown) return;
            this._isMouseDown = false;
         }
   
         document.addEventListener('mousemove', PickerMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
         document.addEventListener('mouseup', endPickerMove);//ou listenerObj.removeEventListener | depende se quiser pegar movement fora do elemento
      }
   }

   

   render(){
      let spacingY = "13px";
      let barHeight = "16px";
      
      let colorSpace = <></>;
      if(this.state.radioSelect === "H"){
         colorSpace = <>
         <div className='relative noselect' style={{width:"256px", height:"256px",
            background: `linear-gradient(0deg, rgba(0,0,0,1), rgba(255,255,255,.0)),linear-gradient(90deg, rgb(255,255,255),${this.state.quadro_SV})`,//esq pra direita
            }} onMouseDown={this.HandleBoardClick} data-board="SV">
            <div className='absolute' style={{width:"10px", height:"10px", border:"1px solid white", borderRadius:"50%", outline:"1px solid black",
               left:`calc(${this.state.hsv.s / 100 * 256}px - 5px)`,
               top:`calc(${(1 - this.state.hsv.v / 100) * 256}px - 5px)`
               }}></div>
         </div>
         <div className='relative noselect' style={{width:"256px", height:`${barHeight}`, marginTop:`${spacingY}`,
            background: "linear-gradient(90deg, rgb(255,0,0),rgb(255,255,0),rgb(0,255,0),rgb(0,255,255),rgb(0,0,255),rgb(255,0,255),rgb(255,0,0))"}}
            onMouseDown={this.HandleBarClick} data-bar="H">
            <div className='absolute nomouse' style={{height:"100%", width:"6px", border:"1px solid black", outline:"1px solid white",left:`calc(${this.state.Hbar_DisplayMark / 360 * 256}px - 3px)`}}>
            </div>
         </div></>
      }
      else if(this.state.radioSelect === "S"){
         colorSpace = <>
         <div className='relative noselect' style={{width:"256px", height:"256px",
            background: `linear-gradient(0deg, rgba(0,0,0,1), rgba(255,255,255,${1 - (this.state.hsv.s / 100)})),\
            linear-gradient(90deg, rgb(255,0,0),rgb(255,255,0),rgb(0,255,0),rgb(0,255,255),rgb(0,0,255), rgb(255,0,255),rgb(255,0,0))`,//esq pra direita
            }} onMouseDown={this.HandleBoardClick} data-board="HV">
               <div className='absolute' style={{width:"10px", height:"10px", border:"1px solid white", borderRadius:"50%", outline:"1px solid black",
                  left:`calc(${this.state.Hbar_DisplayMark / 360 * 256}px - 5px)`,//karina23
                  top:`calc(${(1 - this.state.hsv.v / 100) * 256}px - 5px)`
               }}></div>
         </div>
         <div className='relative noselect' style={{width:"256px", height:`${barHeight}`, marginTop:`${spacingY}`,
            background: `linear-gradient(90deg, rgb(${this.state.hsv.v / 100 * 255},${this.state.hsv.v / 100 * 255},${this.state.hsv.v / 100 * 255}),${this.state.barra_S})`}}
            onMouseDown={this.HandleBarClick} data-bar="S">
            <div className='absolute nomouse' style={{height:"100%", width:"6px", border:"1px solid black", outline:"1px solid white",
               left:`calc(${this.state.hsv.s / 100 * 256}px - 3px)`}}>
            </div>
         </div></>
      }
      else if(this.state.radioSelect === "V"){
         colorSpace = <>
         <div className='relative noselect' style={{width:"256px", height:"256px",
            background: 
            `linear-gradient(0deg, rgba(${this.state.hsv.v * 2.55},${this.state.hsv.v * 2.55},${this.state.hsv.v * 2.55},1), rgba(0,0,0,${1 - (this.state.hsv.v / 100)})),\
            linear-gradient(90deg, rgb(255,0,0),rgb(255,255,0),rgb(0,255,0),rgb(0,255,255),rgb(0,0,255), rgb(255,0,255),rgb(255,0,0))`,//esq pra direita
            }} onMouseDown={this.HandleBoardClick} data-board="HS">
            <div className='absolute' style={{width:"10px", height:"10px", border:"1px solid white", borderRadius:"50%", outline:"1px solid black",
               left:`calc(${this.state.Hbar_DisplayMark / 360 * 256}px - 5px)`,
               top:`calc(${(1 - this.state.hsv.s / 100) * 256}px - 5px)`
            }}></div>
         </div>
         <div className='relative noselect' style={{width:"256px", height:`${barHeight}`, marginTop:`${spacingY}`,
            background: `linear-gradient(90deg, rgb(0,0,0), ${this.state.barra_V})`,}}
            onMouseDown={this.HandleBarClick} data-bar="V">
            <div className='absolute nomouse' style={{height:"100%", width:"6px", border:"1px solid black", outline:"1px solid white",
               left:`calc(${this.state.hsv.v / 100 * 256}px - 3px)`}}>
            </div>
         </div></>
      }

      
      return (
         <div className='fixedFull' style={{zIndex:"999"}}>
            <div className='flexRow absolute b200 el50 radius4'
               style={{gap:"16px", padding:"16px 16px", width:"398px", height:"380px", flexWrap:"wrap", left:`${this.state.posX}px`, top:`${this.state.posY + 20}px`}}>
               <div className='flexRow absolute b300 el100 radius4 noselect f100 h-el300 cursormove' style={{width:"398px", height:"20px", top:"-22px", left:"0px", padding:"1px 5px", fontSize:"13px"}}
                  onMouseDown={this.WindowMoveStart}>
               Color picker

               </div>
               <div className='flexCol' style={{}}>
                  {colorSpace}

                  {/* alpha bar */}
                  <div className='relative' style={{width:"256px", height:`${barHeight}`, marginTop:`${spacingY}`}} onMouseDown={this.HandleAlfaBarClick}>
                     <div className='absolute nomouse noselect' style={{ width:"100%", height:"100%", backgroundColor:"rgb(206,206,206)",
                        //checkerboard
                        backgroundImage:"\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0),\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0)",
                         backgroundPosition: "0 0, 8px 8px", backgroundSize:"16px 16px",}}>
                     </div>
                     
                     <div className='absolute nomouse noselect' style={{ width:"100%", height:"100%",
                        background: `linear-gradient(90deg, rgba(255,255,255,0) , rgb(${this.state.rgb.r},${this.state.rgb.g},${this.state.rgb.b}) 100%)`,}}>
                     </div>
                     <div className='absolute nomouse noselect' style={{height:"100%", width:"6px", border:"1px solid black", outline:"1px solid white", left:`calc(${this.state.alpha / 100 * 256}px - 3px)`}}>

                     </div>
                  </div>
               </div>

               {/* radio button / select */}
               <div className='flexCol' style={{gap:"10px"}}>

                  {/* color display boxes */}
                  <div className='flexCol b300 horcenter' style={{marginBottom:"6px"}}>
                     <span className='f100 noselect' style={{fontSize:"11px", marginBottom:"4px"}}>current</span>
                     <div className='relative' style={{width:"64px", height:"30px"}}>
                     <div className='absolute' style={{width:"64px", height:"30px", backgroundColor:"rgb(206,206,206)",
                         backgroundImage:"\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0),\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0)",
                         backgroundPosition: "0 0, 8px 8px",
                         backgroundSize:"16px 16px",
                         }}/>
                        <div className='absolute' style={{width:"64px", height:"30px", backgroundColor:this.props.valor, marginBottom:"1px"}}></div>
                     </div>

                     <div className='relative' style={{width:"64px", height:"30px"}}>
                        <div className='absolute' style={{width:"64px", height:"30px", backgroundColor:"rgb(206,206,206)",
                         backgroundImage:"\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0),\
                         linear-gradient(45deg, rgb(255,255,255) 25%, transparent 0, transparent 75%, rgb(255,255,255) 0)",
                         backgroundPosition: "0 0, 8px 8px",
                         backgroundSize:"16px 16px",
                         }}/>
                        
                        <div className='absolute' style={{width:"64px", height:"30px", backgroundColor:this.state.corString}}></div>
                     </div>
                     <span className='f100 noselect' style={{fontSize:"12px", marginTop:"3px"}}>new</span>
                  </div>
                  
                  {/* hsv - H */}
                  <div className='flexRow vertcenter' style={{gap:"4px"}}>
                     <span className={`el200 b300 cursor radiusfull flexCol vertcenter horcenter ${this.state.radioSelect === "H" ? "radioON" : ""}`}
                        style={{width:"16px", height:"16px", fontSize:"9px"}} data-index="H" onClick={this.selectColorSpaceSimple}></span>
                        <label className="f100 noselect" style={{width: "10px",fontSize:"10px",margin:"0px 4px"}}>H</label>   
                        <PrxSpinner valor={this.state.hsv.h} update={this.updateControlHSV} name="h"
                           decimals={0} minValue={0} maxValue={359} dragDistance={5} step={1} label="°"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     
                  </div>

                  {/* hsv - S */}
                  <div className='flexRow vertcenter' style={{gap:"4px"}}>
                     <span className={`el200 b300 cursor radiusfull flexCol vertcenter horcenter ${this.state.radioSelect === "S" ? "radioON" : ""}`}
                        style={{width:"16px", height:"16px", fontSize:"9px"}} data-index="S" onClick={this.selectColorSpaceSimple}></span>
                        <label className="f100 noselect" style={{width: "10px",fontSize:"10px",margin:"0px 4px"}}>S</label>   
                        <PrxSpinner valor={this.state.hsv.s} update={this.updateControlHSV} name="s"
                           decimals={0} minValue={0} maxValue={100} dragDistance={10} step={1} label="%"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                     
                  </div>
                  
                  {/* hsv - V */}
                  <div className='flexRow vertcenter' style={{gap:"4px"}}>
                     <span className={`el200 b300 cursor radiusfull flexCol vertcenter horcenter ${this.state.radioSelect === "V" ? "radioON" : ""}`}
                        style={{width:"16px", height:"16px", fontSize:"9px"}} data-index="V" onClick={this.selectColorSpaceSimple}></span>
                        <label className="f100 noselect" style={{width: "10px",fontSize:"10px",margin:"0px 4px"}}>V</label>   
                        <PrxSpinner valor={this.state.hsv.v} update={this.updateControlHSV} name="v"
                           decimals={0} minValue={0} maxValue={100} dragDistance={10} step={1} label="%"
                           fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                  </div>
                  
                  {/* alpha */}
                  <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"end", marginTop:"8px"}}>
                     <label className="f100 noselect nomouse" style={{width: "14px",fontSize:"10px",margin:"0px 4px"}}>A</label>   
                     <PrxSpinner valor={this.state.alpha} update={this.updateControlAlpha} name="alpha"
                        decimals={0} minValue={0} maxValue={100} dragDistance={10} step={1}
                        fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                  </div>

                  {/* rgb - R */}
                  <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"end", marginTop:"7px"}}>
                     <label className="f100 noselect" style={{width: "14px",fontSize:"10px",margin:"0px 4px"}}>R</label>   
                     <PrxSpinner valor={this.state.rgb.r} update={this.updateControlRGB} name="r"
                        decimals={0} minValue={0} maxValue={255} dragDistance={10} step={1} 
                        fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                  </div>

                  {/* rgb - G */}
                  <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"end"}}>
                     <label className="f100 noselect" style={{width: "14px",fontSize:"10px",margin:"0px 4px"}}>G</label>   
                     <PrxSpinner valor={this.state.rgb.g} update={this.updateControlRGB} name="g"
                        decimals={0} minValue={0} maxValue={255} dragDistance={10} step={1}
                        fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                  </div>

                  {/* rgb - B */}
                  <div className='flexRow vertcenter' style={{width:"100%",  justifyContent:"end"}}>
                     <label className="f100 noselect" style={{width: "14px",fontSize:"10px",margin:"0px 4px"}}>B</label>   
                     <PrxSpinner valor={this.state.rgb.b} update={this.updateControlRGB} name="b"
                        decimals={0} minValue={0} maxValue={255} dragDistance={10} step={1}
                        fontSize="11px" maxWidth="50px" maxHeight="18px"/>
                  </div>
                         

               </div>
               
               <span className='f100 absolute noselect' style={{fontSize:"11px", top:"349px", left:"18px"}}>html hex:</span>
               <input className='el200 b300 f100 absolute' style={{maxWidth:"68px", height:"20px", fontSize:"11px", padding:"2px 5px 3px 4px", top:"345px", left:"78px", textAlign:"center"}}
                  type="text" value={this.state.hexColor} onChange={this.hexInputChange} onKeyDown={this.hexInputKeyDown} onFocus={this.onFocusHex} onBlur={this.onBlurHex}/>
               <button className='el200 f100 b300 radius4 absolute cursor h-el300 h-fwhite' style={{fontSize:"11px", width:"80px", height:"22px", top:"345px", left:"296px"}} data-edit="confirm" onClick={this.finishEditing}>Confirm</button>
               <button className='el200 f100 b300 radius4 absolute cursor h-el300' style={{fontSize:"11px", width:"80px", height:"22px", top:"345px", left:"196px"}} data-edit="cancel" onClick={this.finishEditing}>Cancel</button>
               
            </div>  
            

         </div>
      );
      
      
   }

   

   buildRGBstring=(rgbValues)=>{
      return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
   }
   HSVtoRBG=(hsvObj)=>{//hNorm, s, v)=>{//h normalmente fica entre 0° e 360°
      //par => hsvObj {h:0a359 , s:0a100 , v:0a100}
      let s = hsvObj.s / 100;
      let v = hsvObj.v / 100;
      let h = hsvObj.h;//hNorm * 360;
      let c = v * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1))
      let m = v - c;
      let r = 0, g = 0, b = 0;
      if (0 <= h && h < 60) {
         r = c; g = x; b = 0;  
      } else if (60 <= h && h < 120) {
         r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
         r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
         r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
         r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
         r = c; g = 0; b = x;
      }
      r = Math.round((r + m) * 255);//round //ceil
      g = Math.round((g + m) * 255);//round //floor
      b = Math.round((b + m) * 255);//round //floor
      return {r,g,b};
      
   }


   RGBtoHSV=(objRGB)=>{

      let rNorm = objRGB.r/255;
      let gNorm = objRGB.g/255;
      let bNorm = objRGB.b/255;

      let cMax = Math.max(rNorm, gNorm, bNorm);
      let delta = cMax - Math.min(rNorm, gNorm, bNorm);

      let h = 0;
      if(delta === 0){
         h = 0;
      }
      else if(cMax === rNorm){
         h = 60 * (((gNorm - bNorm) / delta) % 6);
      }
      else if(cMax === gNorm){
         h = 60 * (((bNorm - rNorm) / delta) + 2);
      }
      else if(cMax === bNorm){
         h = 60 * (((rNorm - gNorm) / delta) + 4);
      }
      h = Math.round(h);
      if (h < 0) h += 360;//converte hues negativos (wrap)
      let s = cMax === 0 ? 0 : Math.round((delta / cMax) * 100);
      let v = Math.round(cMax * 100);
      
      return{h:h,s:s,v:v};
   }
   
   //vindo da internet
   RGBToHSV_2 = (objRGB) => {
      //outro cara fez a funcao
      let r = objRGB.r/255;
      let g = objRGB.g/255;
      let b = objRGB.b/255;

      const v = Math.max(r, g, b),
        n = v - Math.min(r, g, b);
      const h =
        n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;

      const finalH = Math.round(60 * (h < 0 ? h + 6 : h));
      const finalS = Math.round(v && (n / v) * 100);
      const finalV =  Math.round(v * 100);
      return {h:finalH, s:finalS, v:finalV}
      //return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
   };
   HSVToRGB_2 = (objHSV) => {
      let h = objHSV.h;
      let s = objHSV.s / 100;
      let v = objHSV.v / 100;
      const k = (n) => (n + h / 60) % 6;
      const f = (n) => v * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
      //return [255 * f(5), 255 * f(3), 255 * f(1)];
      const finalR = 255 * f(5);
      
      const finalG = 255 * f(3);
      const finalB =  255 * f(1);
      return {r:finalR, g:finalG, b:finalB}
   };
   
}

export default PrxColorPicker;


