
//no main.jsx 
//import {BuildUtilsFunctions} from './Utils/Utils_Window';
//e antes de iniicar o react
//BuildUtilsFunctions();

export function BuildUtilsFunctions(){
   window.utils = {
      RoundNumber: RoundNumber,
      ClampNumber: ClampNumber,
      DegToRad: DegToRad,
      RadToDeg: RadToDeg,
      getRandomInt: getRandomInt,
   }

   window.RoundNumber = RoundNumber;
   window.ClampNumber = ClampNumber;
   window.DegToRad = DegToRad;
   window.getRandomInt = getRandomInt;
   window.getRandomFloat = getRandomFloat;
}

//arredonda o numero pra o numero de casas decimais indicado
export const RoundNumber = (x, decimalPlaces)=>{//n eh o numero de casas decimais
   //quando o decimal places é null, ele eh tratado como 0
   if(decimalPlaces < 0) decimalPlaces = 0;
   const d = Math.pow(10, decimalPlaces);
   return Math.round((x + Number.EPSILON) * d) / d;
}

//clamp o numero entre min e max
export const ClampNumber = (num, min, max)=>{
   
   if(max === null || max === undefined){
       max = Number.MAX_VALUE;
   }
   if(min === null|| min === undefined){
       min = -Number.MAX_VALUE;
   }

   return Math.min(Math.max(num, min), max);
}

//converte o angulo em degree to radians
const PIover180 = (Math.PI/180);
export const DegToRad = (degrees) => {
   return degrees * PIover180;
}
export const RadToDeg = (radians) => {
   return radians *(180 / Math.PI);
}

export function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1) ) + min;
}
export function getRandomFloat(min, max) {
   return Math.random() * (max - min + 1) + min;
}

export function normalize(value, min, max){
   return (value - min)/(max-min);
}
export function lerp(normalValue, min, max){
   return min + (max - min) * normalValue
}

export function mapNumber(value, sourceMin, sourceMax, destMin, destMax){
   return ((value - sourceMin)/(sourceMax-sourceMin)) * (destMax - destMin) + destMin;
   //n = normalize(value, sourceMin, sourceMax);
   //lerp(n, destMin, destMax);
}


