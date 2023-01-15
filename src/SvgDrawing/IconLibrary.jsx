import {Component, createRef} from 'react';
import {TokenHelper, buildPathObjects, BuildSvgString} from './HelperDraw.jsx';

class IconLibrary extends Component{
   static defaultProps = {
      
   }
   constructor(props){
      super(props)
      this.state={
         all_Icons: null,
         localStorageSpaceFill: null,//considerando um storage de 5 MB > 0 a 1 


         iconIndexSelected: -1,
         iconTempName: "",

         menuPosX: 0,
         menuPosY: 0,
         windowsOpened: {
            iconMenu: false, //o menu com as opcoes
            renameIcon: false,//pra rename o icon
            iconDelete: false, //o path pra copy/paste
            
         },

      }

      this.windowsRef ={
         menuGeral: createRef(),
         renameWindow: createRef(),
         deleteIconWindow: createRef(),
      
      }

   }
   
   // allIcons: [
   //    {iconName, viewBoxWidth ,viewBoxHeight, svgPaths[]},
   //    {iconName, viewBoxWidth ,viewBoxHeight, svgPaths[]},
   // ]


   //esse valor prxIcons -> a key do local storage, devia ser guardada em algum lugar de CONSTANTS e tal...

   componentDidMount=()=>{
      //load os treco do local storage
      this.loadAllLocalStorage();//sera que ele chama isso ? mesmo com o update ali em baixo returning false?
      this.forceUpdate(); //ta aqui so pq o shouldComponentUpdate ta sempre como false.
   }
   loadAllLocalStorage=()=>{
      let all_Icons = JSON.parse(window.localStorage.getItem("prxIcons"));
      if(all_Icons != null){
         this.setState({all_Icons: all_Icons, localStorageSpaceFill: this.calcLocalStorageSpace()});
         return;
      }
      //nao tem nada no localStorage
      console.log("nothing on local storage all_Icons: ", all_Icons);
   }

   //pra saber o espaco do local storage
   calcLocalStorageSpace=()=>{
      let allStrings = '';
      for(let key in window.localStorage){
         if(window.localStorage.hasOwnProperty(key)){
            allStrings += window.localStorage[key];
         }
      }
      let sizeInKB = allStrings ? 3 + ((allStrings.length*16)/(8*1024)) : 0;
      let sizeInMB = sizeInKB / 1024;
      let storagePercentFill = window.utils.RoundNumber((sizeInMB / 5), 3);
      return storagePercentFill;
   }

   shouldComponentUpdate=()=>{
      return false;
   }

   ClearLocalStorage=()=>{
      window.localStorage.removeItem("prxIcons");
      console.log("deleted local storage");
   }
   checkLocalStorage=()=>{
      let allStrings = '';
      for(let key in window.localStorage){
         //console.log(key);
         if(window.localStorage.hasOwnProperty(key)){
            console.log(key);
            allStrings += window.localStorage[key];
         }
      }

      let sizeInKB = allStrings ? 3 + ((allStrings.length*16)/(8*1024)) : 0;
      let sizeInMB = sizeInKB / 1024;
      let final = allStrings ? 3 + ((allStrings.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
      let finalMB = allStrings ? (3 + ((allStrings.length*16)/(8*1024))) / 1024 + ' MB' : 'Empty (0 KB)';

      let percent = (sizeInMB / 5) * 100;
      let percentFull = (5 / 5) * 100;
      console.log(final);
      console.log(finalMB);
      console.log(percent);
      console.log(percentFull);
   }
   

   
   componentWillUnmount=()=>{
      
   }
   
   
   //actions
   LoadIcon=(e)=>{
      const svgIcon = this.state.all_Icons[this.state.iconIndexSelected];
      this.setState({windowsOpened: this.resetWindows()}, () => this.props.loadSvgFromLib(svgIcon));//close window
      this.forceUpdate();
   }
   CopySvgPath=(e)=>{
      const svgType = e.currentTarget.getAttribute("data-svgtype");
      //console.log(svgType);//react ou //html
      const svgIcon = this.state.all_Icons[this.state.iconIndexSelected];
      let result = BuildSvgString(svgIcon.viewBoxWidth, svgIcon.viewBoxHeight, svgIcon.svgPaths);
      if(svgType === "react"){
         navigator.clipboard.writeText(result.reactString);
      }
      else if(svgType === "html"){
         navigator.clipboard.writeText(result.htmlString);
      }
      
      this.sendMessageEvent(e, `${svgType} svg copied!`);
      
   }
   sendMessageEvent=(e, message)=>{
      let startEvent = new Event("prxMessageEvent");
      startEvent.prxData = {xPos: e.clientX, yPos: e.clientY, text:message};
      dispatchEvent(startEvent);
   }

   DeleteIcon=()=>{
      let arr = this.state.all_Icons;
      arr.splice(this.state.iconIndexSelected, 1);
      const allIconsJSON = JSON.stringify(arr);
      window.localStorage.setItem("prxIcons", allIconsJSON);
      this.setState({all_Icons: arr, windowsOpened: this.resetWindows(), localStorageSpaceFill: this.calcLocalStorageSpace()});//close window
      this.forceUpdate();
   }

   RenameItem=(e)=>{
      //const svgIcon = this.state.all_Icons[this.state.iconIndexSelected];
      let allIcons = this.state.all_Icons;
      let svgIcon = allIcons[this.state.iconIndexSelected];
      const i = allIcons.findIndex(element => element.iconName === this.state.iconTempName);
      if (i > -1) {
         //ja existe um icone com esse nome... cancela
         //console.log("An Icon already exists with that name...try another");
         this.sendMessageEvent(e, "icon already exist, try another name");
      }
      else{
         //nao tem icone com esse nome, posso salvar de boa 
         svgIcon.iconName = this.state.iconTempName;
         const allIconsJSON = JSON.stringify(allIcons);
         window.localStorage.setItem("prxIcons", allIconsJSON);
         this.setState({all_Icons: allIcons, windowsOpened: this.resetWindows(), iconIndexSelected: -1, iconTempName: ""});//close window
         this.sendMessageEvent(e, "icon name changed");
         this.forceUpdate();
         

      }
   
   }
   
   
   //windows
   OpenCardMenu=(e)=>{
      const indexSelected = e.currentTarget.getAttribute("data-index");
      if(indexSelected === null) return;
      // if(this.state.iconIndexSelected === indexSelected)return;

      // console.log("open");
      let menuPosX = e.currentTarget.getBoundingClientRect().x;
      let menuPosY = e.currentTarget.getBoundingClientRect().y;
      
      //open o menu
      let newWindowOpened = this.resetWindows();
      newWindowOpened.iconMenu = true;
      this.setState({iconIndexSelected: indexSelected, windowsOpened: newWindowOpened, menuPosX: menuPosX, menuPosY: menuPosY}, ()=> this.windowsRef.menuGeral.current.focus());
      this.forceUpdate();
   }
   OpenRenameWindow=(e)=>{
      let newWindowOpened = this.resetWindows();
      newWindowOpened.renameIcon = true;
      let svgIconName = this.state.all_Icons[this.state.iconIndexSelected].iconName;
      this.setState({windowsOpened: newWindowOpened, iconTempName: svgIconName}, ()=> this.windowsRef.renameWindow.current.focus());
      this.forceUpdate();
   }
   OpenDeleteWindow=(e)=>{
      let newWindowOpened = this.resetWindows();
      newWindowOpened.iconDelete = true;
      this.setState({windowsOpened: newWindowOpened}, ()=> this.windowsRef.deleteIconWindow.current.focus());
      this.forceUpdate();
   }
   WindowCloseKeyPress=(e)=>{
      if(e.key === "Escape"){
         this.setState({windowsOpened: this.resetWindows()});//close window
         this.forceUpdate();
      }
   }
   CloseFullScreenWindow=(e)=>{
      if(e.button === 0){
         if(e.target === e.currentTarget){
            const startTime = Date.now();
            const closeIconWindows = (e) => {
               let deltaTime = Date.now() - startTime;
               if(deltaTime < 120){
                  this.setState({windowsOpened: this.resetWindows()});
                  this.forceUpdate();
               }
               document.removeEventListener('mouseup', closeIconWindows);
               if (!this._isMouseDown) return;
               this._isMouseDown = false;
            }
            document.addEventListener('mouseup', closeIconWindows);
         }
      }
   }
   closeWindowClick=(e)=>{
      this.setState({windowsOpened: this.resetWindows()});//close window
      this.forceUpdate();
   }
   resetWindows=()=>{
      let closeWindows = this.state.windowsOpened;
      for (const key in closeWindows) {
         closeWindows[key] = false;
      }
      return closeWindows;
   }

   //input name
   inputUpdate=(e)=>{
      this.setState({[e.target.name]: e.target.value});
      this.forceUpdate();
   }
   inputHandleKeyDown=(e)=>{
      if(e.key === "Enter"){
         e.currentTarget.blur();
         this.RenameItem();
      }
      else if(e.key === "Escape"){
         e.currentTarget.blur();
         e.stopPropagation();
         this.windowsRef.renameWindow.current.focus();
      }
   }

   render(){
      const percentFill = window.utils.RoundNumber(this.state.localStorageSpaceFill * 100, 2);
      let iconCardWidth = 194;
      if(this.state.all_Icons != null){
         if(this.state.all_Icons.length > 18){
            iconCardWidth = 178;
         }
      }

      const cardClass = "flexRow h-el300 cursor";
      let iconCard = [];
      if(this.state.all_Icons != null){
         for(let i = 0; i < this.state.all_Icons.length; i++){
            let iconObj = this.state.all_Icons[i];
            //{iconName, viewBoxWidth viewBoxHeight, svgPaths[]},
            let pathsInsideSVG = buildPathObjects(iconObj.svgPaths);
            let viewBoxString = `0 0 ${iconObj.viewBoxWidth} ${iconObj.viewBoxHeight}`
            let card = <div className={cardClass} style={{width:`${iconCardWidth}px`, padding:"4px 4px", gap:"4px", overflow:"hidden"}} key={crypto.randomUUID()} onClick={this.OpenCardMenu} data-index={i}>
               <div className='b200' style={{width:"48px", height:"48px"}}>
                  <svg width="48" height="48" viewBox={viewBoxString}>
                     {pathsInsideSVG}
                  </svg>
               </div>
               <div className="flexCol">
                  <span className='f100' style={{fontSize:"12px", marginBottom:"3px"}}>{iconObj.iconName}</span>
                  <span className='f100' style={{fontSize:"12px",}}>{iconObj.viewBoxWidth}x{iconObj.viewBoxHeight}</span>
               </div>
            </div>
            iconCard.push(card);
         }   
      }
      
      let mainButtonClassName = "radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor";
      let mainButtonStyle = {
         width:"48px", height:"18px", fontSize:"10px", textAlign:"center",
      }

      
      
      

      const blurRadius = 2;
      const bgColor = `rgba(0,0,0,.5)`;
      const rectClipPath = `polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%, 0 100%,\
         ${this.state.menuPosX}px ${this.state.menuPosY}px,\
         ${this.state.menuPosX}px ${this.state.menuPosY + 58}px,\
         ${this.state.menuPosX + iconCardWidth}px ${this.state.menuPosY + 58}px,\
         ${this.state.menuPosX + iconCardWidth}px ${this.state.menuPosY}px,\
         ${this.state.menuPosX}px ${this.state.menuPosY}px`;

      return (

         <div>
            <div className='flexCol' style={{gap:"0px", width:"600px"}}>
               <p className='f100 noselect' style={{height: "17px", marginBottom:"0px", whiteSpace:"pre"}}> Library</p>
               <div className="b-top300" style={{width:"100%", gap:"4px", padding:"4px 4px"}}></div>
                  <div className='grid b300' style={{height:"400px", overflowY:"auto", overflowX:"clip", gap:"9px", gridTemplateColumns:"1fr 1fr 1fr", gridAutoRows:"56px"}}>
                     {iconCard}
                  </div>
               </div>
               <div className='relative' style={{height:"20px", margin:"2px 0"}}>
                  <div className='absolute el300' style={{left:"0", top:"0", width:`calc(600px * ${this.state.localStorageSpaceFill})`, height:"20px"}}></div>
                  <p className='absolute f100' style={{fontSize:"11px", top:"5px"}}>{`storage: ${percentFill}% full`}</p>
               </div>

            <div className='flexRow' style={{gap:"4px"}}>
               <button className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor" onClick={this.ClearLocalStorage}>Clear local storage</button>
               <button className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor" onClick={this.checkLocalStorage}>Check local storage</button>
               <button className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor" onClick={this.downloaJSONFile}>Download Json File</button>

               <label className="radius4 el200 h-el300 f100 h-fwhite pointer b300 cursor" htmlFor="uploadJson" style={{fontSize:"12px", padding:"1px 4px"}}> Upload Json File</label>
               <input className="displaynone" type="file" id="uploadJson" onChange={this.convertFileUploadToJSON}/>
            </div>
            

            {/* menu geral */}
            {
               this.state.windowsOpened.iconMenu && 
               <>
               <div className='fixedFull' ref={this.windowsRef.menuGeral} onKeyDown={this.WindowCloseKeyPress} tabIndex="-1"
                     style={{zIndex:"999", backdropFilter:`blur(${blurRadius}px)`, backgroundColor:`${bgColor}`, clipPath:`${rectClipPath}`}} onMouseDown={this.CloseFullScreenWindow} >
                  <div className='absolute el300 b500' style={{width:`${iconCardWidth}px`, height:"108px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY + 58}px`}}  onClick={this.closeMenu}>
                     <button onClick={this.LoadIcon}>Load Icon</button>
                     <button onClick={this.CopySvgPath} data-svgtype="react">Clipboard - react</button>
                     <button onClick={this.CopySvgPath} data-svgtype="html">Clipboard - html</button>
                     <button onClick={this.OpenRenameWindow}>Rename Icon</button>
                     <button onClick={this.OpenDeleteWindow}>Delete Icon</button>
                  </div>
               </div>
               <div className='fixedFull' style={{zIndex:"998"}}></div>
               </>
               
            }

            {/* rename icon window */}
            {
               this.state.windowsOpened.renameIcon && 
               <> 
               <div className='fixedFull' ref={this.windowsRef.renameWindow} onKeyDown={this.WindowCloseKeyPress} tabIndex="-1"
                     style={{zIndex:"999", backdropFilter:`blur(${blurRadius}px)`, backgroundColor:`${bgColor}`, clipPath:`${rectClipPath}`}} onMouseDown={this.CloseFullScreenWindow} >
                     <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:`${iconCardWidth}px`, height:"108px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY + 58}px`}}>
                        <span className="f100 noselect" style={{fontSize:"11px", margin:"0px 0px 0 5px"}}>Rename Icon:</span>
                        
                        <input className="radius4 el200 b300 f200 cursor" style={{margin:"10px 0 0 0", fontSize:"11px", width:"168px", height:"24px", padding:"2px 5px"}}
                           value={this.state.iconTempName} name="iconTempName" onChange={this.inputUpdate} onKeyDown={this.inputHandleKeyDown} id="iconTempName" type="text"/>

                        <div className='flexRow horcenter' style={{marginTop:"8px", gap:"20px"}}>
                           <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} onClick={this.RenameItem}>YES</button>
                           <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} onClick={this.closeWindowClick}>NO</button>
                        </div>
                     </div>
                  </div>
                  <div className='fixedFull' style={{zIndex:"998"}}></div>
               </>
            }

            {/* delete icon window */}
            {
               this.state.windowsOpened.iconDelete &&
               <> 
               <div className='fixedFull' ref={this.windowsRef.deleteIconWindow} onKeyDown={this.WindowCloseKeyPress} tabIndex="-1"
                     style={{zIndex:"999", backdropFilter:`blur(${blurRadius}px)`, backgroundColor:`${bgColor}`, clipPath:`${rectClipPath}`}} onMouseDown={this.CloseFullScreenWindow} >
                  <div className='absolute el300 b500 flexCol' style={{gap:"2px", padding:"2px 2px", width:`${iconCardWidth}px`, height:"108px", left:`${this.state.menuPosX}px`, top:`${this.state.menuPosY + 58}px`}}>
                     <span className="f100 noselect" style={{fontSize:"11px", margin:"0px auto 0 auto"}}>Delete Icon</span>
                     <span className="f100 noselect" style={{fontSize:"11px", margin:"0px auto 0 auto"}}>Are you sure?</span>
                     
                     <div className='flexRow horcenter' style={{marginTop:"16px", gap:"20px"}}>
                        <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} onClick={this.DeleteIcon}>YES</button>
                        <button className={mainButtonClassName + " h-b-acc100"} style={{...mainButtonStyle, display:"inline-block"}} onClick={this.closeWindowClick}>NO</button>
                     </div>
                  </div>
               </div>
               <div className='fixedFull' style={{zIndex:"998"}}></div>
               </>
            }
            
            
         </div>
      );
   }
   
   convertFileUploadToJSON=(e)=>{
      //leio a file,
      let fileObject = e.currentTarget.files[0];

      // Create a new FileReader() object
	   let reader = new FileReader();
      const logFile =(event)=> {
         let str = event.target.result;
         let json = JSON.parse(str);
         //fazer checks antes de botar o json aqui ?? ou foda-se?
         this.setState({all_Icons: json}, ()=> this.replaceItemsInStorage());
         //save pro localStorage?
         this.forceUpdate();
      }

      // Setup the callback event to run when the file is read
	   reader.onload = logFile;
      // Read the file
	   reader.readAsText(fileObject);
   }
   replaceItemsInStorage=()=>{
      const allIconsJSON = JSON.stringify(this.state.all_Icons);
      window.localStorage.setItem("prxIcons", allIconsJSON);

      //recount size - refactor pra uma funcao (la em cima usa isso tb)
      let allStrings = '';
      for(let key in window.localStorage){
         //console.log(key);
         if(window.localStorage.hasOwnProperty(key)){
            allStrings += window.localStorage[key];
         }
      }
      let sizeInKB = allStrings ? 3 + ((allStrings.length*16)/(8*1024)) : 0;
      let sizeInMB = sizeInKB / 1024;
      let storagePercentFill = window.utils.RoundNumber((sizeInMB / 5), 3);
         
      this.setState({localStorageSpaceFill: storagePercentFill});
      this.forceUpdate();
   }

   downloaJSONFile=(e)=>{
      //open um prompt pra escolher o fileName e depois faz o download... :)

      let text = JSON.stringify(this.state.all_Icons, null, 2);//o 2 no final eh pra dar espaco de 2 nos {  } e [] ...do json
      let filename = "icones.json";
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
   }

}


export default IconLibrary;