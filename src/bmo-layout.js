// All front controls share the same mounting plane and depth.
export const BMO_LAYOUT={
 body:{width:2.65,height:3.35,depth:1.14,centerY:1.8,radius:.115},
 screen:{x:0,y:2.52,z:.590,width:2.12,height:1.49725,radius:.105},
 controlZ:.580,controlDepth:.024,pressTravel:.009,
 controls:[
  {id:'dpad',action:'dpad',x:-.67,y:.98,width:.56,height:.56,shape:'cross',color:'#f7d661'},
  {id:'triangle',action:'room',x:.27,y:1.02,width:.34,height:.32,shape:'triangle',color:'#78c1d4'},
  {id:'red',action:'confirm',x:.38,y:.49,width:.422,height:.422,shape:'circle',color:'#de4568'},
  {id:'green',action:'back',x:.92,y:.94,width:.264,height:.264,shape:'circle',color:'#b3df58'},
  {id:'blue',action:'sound',x:.92,y:1.56,width:.112,height:.112,shape:'circle',color:'#2431a0'}
 ]
};
export function roomAnchor(width,height){
 const scale=Math.max(width/735,height/414);
 const cropX=(width-735*scale)/2,cropY=(height-414*scale)/2;
 return {x:Math.max(width*.40,Math.min(width*.60,cropX+735*.535*scale)),
  y:Math.max(height*.68,Math.min(height*.77,cropY+414*.745*scale))};
}
