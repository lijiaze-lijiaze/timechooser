import React from 'react';
import {Component} from 'react';
import { addEventListener, removeEventListener, addDomResize, removeDomResize } from './event';

import './App.css';

class Timechooser extends React.Component {
  constructor(props){
    super(props);
    this.state={
     //props值，暂时写死。
     //boundary:this.getboundary(props),
     boundary:{
       end:100,
       start:0
     },
     sliderWidth:0,
     //start: this.getStartInitialize(props),
     start: 0
    }
    this.isDrag = false
    this.handleDrag = this.handleDrag.bind(this)
    this._refs = {}
  }
  componentDidMount(){
    this.setState({
      sliderWidth:this._refs.slider.offsetWidth
    })
  }
  render () {
    const{ start,end,sliderWidth} = this.state;
    let leftSize = '';
    
    return (
      <div className='slider' ref={ ( node )=>this._refs.slider = node}>
        <div className='track' style={{width:`${ start }%`,left:`${ leftSize }%`}}>

        </div>
        <div className='step'>

        </div>
        <div className='handle' onMouseDown={this.handleDrag} ref={(node) => {this._refs.drag = node}} style={ { left: `${ start }%` } }>

        </div>
        
        <div className='pop'>
          <div className='arrow'>

          </div>
          <div className='content'>

          </div>
        </div>
      </div>
    ) 
  }

  handleDrag = () => {
    const{step,max,min} = this.props;
    const slider = this._refs.slider;
    //console.log("slider",this._refs.slider,this._refs)
    const sliderViewLeft = slider.getBoundingClientRect().left;
    console.log("sliderViewLeft",sliderViewLeft)
    const width = slider.offsetWidth;
    const widthMax = this.state.boundary.end;
    const widthMin = this.state.boundary.start;
    const exPosition = this.state.start;
    let stepSize = 0;
    this.setState({
      sliderWidth:this._refs.slider.offsetWidth
    })
    if(step){
      stepSize = step / ( max - min ) * 100;
    }

    const move = (event) =>{
      console.log('event', event)
      const eventhandle = event;
      eventhandle.preventDefault();
      const moveX = eventhandle.clientX;
      let newposition =(moveX - sliderViewLeft) / width *100;
      
      console.log('newposition',Math.floor(newposition))
       if(newposition<=widthMin){
        newposition=widthMin;
      }else if(newposition>=widthMax){
        newposition=widthMax;
      } 
      this.setState({
        start:newposition
      })
    }
    const up = () =>{
      let num = this.state.start;
      //读取默认值
      if(step){

      }
      removeEventListener( document, 'mousemove', move );
      removeEventListener( document, 'mouseup', up );
    }
    addEventListener(document, 'mousemove', move);
    addEventListener(document, 'mouseup',up)

    // this._refs.drag.addEventListener("mousemove", move);
    console.log('this', this)
  }
  getboundary = (props) => {
    const {boundary,min,max} = props;
    const bound = {};
    if(typeof boundary ==='number'){
      bound.start=(boundary-min)/(max-min)*100;
      bound.end =100;
    }else{
      bound.start=0;
      bound.end=100;
    }
    return bound;
    
  }
  getStartInitialize = (props) =>{
    const short = props.max - props.min;
    const num = ( props.defaultValue - props.min ) / short;
    return num * 100; 
  }
}

export default Timechooser;

