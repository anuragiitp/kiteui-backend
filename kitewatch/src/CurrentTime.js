

import React from 'react';
import './App.css';



class CurrentTime extends React.Component {
  constructor(props) {
    super(props);
    this.state={};
  }


componentDidMount() {
  this.timeInterval =  setInterval(this.startTime,500);
}

  componentWillUnmount(){
    clearInterval( this.timeInterval );
  }

checkTime=(i)=>{
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}


startTime=(event)=>{
  let today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  // add a zero in front of numbers<10
  m = this.checkTime(m);
  s = this.checkTime(s);
  this.timeInterval = setTimeout(function() {
    this.startTime()
  }.bind(this), 500);

  this.setState({currentTime:(h + ":" + m + ":" + s)});
}



  render() {


    const{
      currentTime
    }=this.state;

     
    return (
           <div className='currentTime'>{currentTime}</div>
         )
  }

}


export default CurrentTime;
