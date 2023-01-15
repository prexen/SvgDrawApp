import {Component , createRef} from 'react';

class MessageBox extends Component{
   static defaultProps = {
      
   }
   constructor(props){
      super(props)
      this.state={
         message: "",
         boxWidth: 200,
         leftPos: 0,
         topPos: 0,
      }

      this.divRef = createRef();
   }
   componentDidMount=()=>{
      addEventListener('prxMessageEvent', this.solvePrexEvent);
   }
   componentWillUnmount=()=>{
      removeEventListener('prxMessageEvent', this.solvePrexEvent);
   }

   solvePrexEvent=(prxEvent)=>{
      let posX = prxEvent.prxData.xPos;
      let posY = prxEvent.prxData.yPos;
      let message = prxEvent.prxData.text;

      let messageWidth = message.length * 10;
      this.setState({message: message, leftPos: posX, topPos:posY, boxWidth: messageWidth});
      this.divRef.current.style.animation = "none";                                    //essas 3 linhas eh que fazem a animation resetar
      this.divRef.current.offsetWidth;                                                 //tem q fazer "none", botar o offsetWith e depois 
      this.divRef.current.style.animation = "fadeInBox 1.5s normal forwards ease-in-out"; //so que seta a animation
   }

   

   render(){
      const fadeOutAnim = {
         width: `${this.state.boxWidth}px`,
         height: "20px",
         opacity: 0,
         left: `${this.state.leftPos - (this.state.boxWidth * 0.5)}px`,
         top: `${this.state.topPos + 10}px`,
         zIndex: "2200",
      }
      return (
         <>
            <div className='nomouse noselect f100 el200 fixed radius4' ref={this.divRef} style={{...fadeOutAnim, textAlign:"center"}}>
               {this.state.message}
               <style>
                        {`
                     @keyframes fadeInBox{
                        0% {
                           opacity: 1;
                        }
                        10% {
                           opacity: 1;
                        }
                        50% {
                           opacity: 1;
                        }
                        100% {
                           opacity: 0;
                        }
                     }
                     `}</style>
            </div>
         </>
      );
   }
}

export default MessageBox;
