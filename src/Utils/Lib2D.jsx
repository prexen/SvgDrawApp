
export class Vector2D {
   constructor(p1, p2){
      //ou entao passar p1 e p2, e no constructor eu faço:
      this.p1 = p1;
      this.p2 = p2;
      this.dx = p2.x - p1.x;
      this.dy = p2.y - p1.y;
      this.lenght = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      this.ln = {x: this.dy, y: -this.dx};
      this.rn = {x: -this.dy, y: this.dx};
      this.midP = {x: p1.x + this.dx * 0.5, y: p1.y + this.dy * 0.5};
      this.midX = p1.x + this.dx * 0.5;//p1.x + (p2.x - p1.x) * 0.5;
      this.midY = p1.y + this.dy * 0.5;//p1.y + (p2.y - p1.y) * 0.5;
   }

   getLenght(){
      return this.lenght;
   }

   getDirection(){
      let xDir = this.dx / this.lenght;
      let yDir = this.dy / this.lenght;
      return new Vector2D({x:0,y:0}, {x: xDir, y:yDir} );
   }

}

export function dotProduct(A, B){
   return (A.dx * B.dx + A.dy * B.dy);
   //o cara ta usando 
   //let dotScaled = A.dx * (B.dx / B.getLenght()) + A.dy * (B.dy / B.getLenght());
   //let b = ((A.dx * B.dx) +  (A.dy * B.dy)) / B.getLenght();
   //return dotScaled;

}

//ainda nao testei essas funcoes direito
export function addVector(A, B){
   return new Vector2D(A.p1.x + B.p2.x , A.p2.y + B.p2.y);
}

// export function project(A,B){
//    //return ((A.p1.x * B.p2.x + A.p1.y * B.p2.y) / B.getLenght());
//    //return ((A.dx * B.dx + A.dy * B.dy) / B.getLenght());
//    let projAB = dotProduct(A,B) / B.getLenght();
   
//    //console.log(vx);
//    //console.log(vx, vy);
//    //var projection_Vx:Number = dotProduct * _v2.dx;
//    //var projection_Vy:Number = dotProduct * _v2.dy;
//    let projectedVx = projAB + B.p1.x;
//    let projectedVy = projAB + B.p1.y;
//    console.log(projectedVx, projectedVy);

//    let L1 = new Vector2D(B.p1, A.p1);
//    let L2 = new Vector2D(B.p1, A.p2);
//    let L1onB = dotProduct(L1,B) / B.getLenght();
//    let L2onB = dotProduct(L2,B) / B.getLenght();
   
//    console.log(L1onB, L2onB);
//    let t1 = L1onB / B.getLenght();
//    let t2 = L2onB / B.getLenght();
//    console.log(t1, t2);
//    //vertor direcao do B
//    let dirB_x = B.dx / B.getLenght();
//    let dirB_y = B.dy / B.getLenght();


//    let finalP1_x = B.p1.x +  dirB_x * L1onB;
//    let finalP1_y = B.p1.y +  dirB_y * L1onB;
//    console.log("coord finalP1: ", finalP1_x, finalP1_y); //works
//    let finalP2_x = B.p1.x +  dirB_x * L2onB;
//    let finalP2_y = B.p1.y +  dirB_y * L2onB;
//    console.log("coord finalP2: " ,finalP2_x, finalP2_y); //works

//    let vec1 = new Vector2D({x: finalP1_x, y: finalP1_y}, B.p1);
//    console.log(vec1.lenght);

// }


// export function Projection(A,B){
//    let projLenght = ((A.dx * B.dx + A.dy * B.dy) / B.getLenght());
//    return new Vector2D()
// }

// export function normalize(A){
//    //retorna um novo vector normalizado
// }

