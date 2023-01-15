import {Component} from 'react';

//usage
//<SelectTeste  valor={this.state.strokeLinejoin} updateParent={this.updateSlider} name={"strokeLinejoin"} options={this.props.strokeJoinTypes} maxWidth="186px" height="22px" fontSize="11px"/>
//o options eh uma array com os valores , name eh o state name do parent

class PrxSelect extends Component{
   static defaultProps = {
      fontSize: ""
   }
   constructor(props){
      super(props)
      this.state={
         menuOpen: false,
      }
   }

   componentDidMount=()=>{
      
   }
   
   selectItem=(e)=>{
      //e.stopPropagation();
      this.closeMenu();
      let valor = e.currentTarget.attributes["prxvalue"].nodeValue;
      if(valor != this.props.valor){
         this.props.update({name: this.props.name, value:valor});   
      }
   }

   openMenu=(e)=>{
      if(this.state.menuOpen) return;
      this.setState({menuOpen: true})
   }
   closeMenu=(e)=>{
      this.setState({menuOpen: false})
   }
   
   render(){

      let menuCenterCalc = `calc((${this.props.width} - ${this.props.menuWidth}) * 0.5)`;
      //let leftPosMenu = (this.props.width - this.props.menuWidth) * 0.5; vem como px ou % ou sei la o q...

      return (
         <>
            <div className='radius5 el200 b300 h-b-acc100 flexRow vertcenter relative'
               style={{padding:"2px 4px", justifyContent:"space-between", width:this.props.width, height:this.props.height, maxWidth:this.props.maxWidth}}
               onClick={this.openMenu}
               >
               <span className="noselect f100"
                style={{fontSize:this.props.fontSize, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                  {this.props.valor}</span>
                  <svg  width="12" height="12" viewBox="0 0 24 24" fill="none" cursor="pointer" style={{flexShrink:"0"}}>
                     <path d="M20 8H4l8 8 8-8z" fill="#a9b8ff"></path>
                  </svg>

               {this.state.menuOpen &&
               <> 
                  <div className='fixedFull' style={{backgroundColor:"none", zIndex:"9999999"}} onClick={this.closeMenu}></div>
                  <ul className='radius5 el300 b100 flexCol f300 absolute' style={{maxWidth:this.props.maxWidth, top:this.props.height,
                      left:menuCenterCalc,
                      width:this.props.menuWidth, zIndex:"99999999"}}>
                     {this.props.options.map(item => {
                        return (<li className='h-el400 f100 noselect' style={{padding:"3px 4px", fontSize:this.props.fontSize, zIndex:"99999999"}}
                              prxvalue={item} onClick={this.selectItem} key={crypto.randomUUID()}>{item}</li>
                        );
                     })}
                  </ul>
                  
               </>
               }              
            </div>
            
         </>
      );
   }
}

export default PrxSelect;