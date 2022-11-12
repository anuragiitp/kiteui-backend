import React from 'react';
import './App.css';



class GlobalindexList extends React.Component {
  constructor(props) {
    super(props);
    this.rowOrder=[4,1,2,3,6,7,8,11,12,13];
  }

  render() {

    const{
      investingdata
    }=this.props;

    return (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Change</th>
              </tr>
            </thead>

            <tbody>
            
             { this.rowOrder.map((order,index)=> <WatchListRow key={investingdata.index[order][0]+index} investingdata={investingdata} data={investingdata.index[order]} />)}
             
            </tbody>
        </table>
    )
  }

}


export default GlobalindexList;

class WatchListRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    const{
      data
    }=this.props;


    let changeClass =data[13].startsWith("-") ?'red':'green';
    
      return (
        <tr>
          <td>{data[0]}</td> 
          <td className={changeClass} >{data[13]}</td>            
         </tr>
      );

  }

}