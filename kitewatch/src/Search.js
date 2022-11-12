import React from 'react';
import './App.css';
import { IoIosSearch } from 'react-icons/io'


class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state={searchValue:undefined};
  }


  onInputValueChange=(evt)=>{

    let{
		searchValue
    }=this.state;

    const{
      kitedata,
      onTableRowclick
    }=this.props;

  	if(evt.target.name == 'searchInput'){
  		searchValue=evt.target.value.toUpperCase();
  		let rowMap={};

  		if(searchValue.length>2){

	  		let matchs = document.querySelectorAll('tr[rowid*="'+ searchValue +'"]');
	  		if(matchs && matchs.length>0){
	  			for(let i=0;i<matchs.length;i++){
	  				let rowId = matchs[i].attributes.rowid.value.replace('1-','').replace('2-','').replace('3-','').replace('0-','').replace('RES-','').replace('MIS-','').replace('POS-','').replace('HOLD-','').replace('MIS_ORDER-','');
	  				if(kitedata.ticks[rowId]){
	  					rowMap[rowId]=kitedata.ticks[rowId].name;
	  				}  				
	  			}
	  		}

  		}

  		if(kitedata.ticks[searchValue]){
  			onTableRowclick(searchValue);
  		}
  		this.setState({searchValue:searchValue,rowMap:rowMap});
  		
  	}

  }  

  render() {


    let{
		searchValue,
		rowMap
    }=this.state;

    const{
      kitedata,
      onTableRowclick
    }=this.props;

    return (
    	<div className="dropdown">
          <button className="dropbtn"><IoIosSearch className="appicon"/></button>
          <div className="dropdown-content searchList">

		  <input list="searchDataList" className='searchInput' type="text"  name="searchInput" ref={elem => (this.searchInput = elem)} onClick={event => event.target.select()}  onInput={this.onInputValueChange}  value={searchValue}></input>
		  <datalist id="searchDataList">
		    {rowMap && Object.keys(rowMap).map((data,index)=> <option value={data}>{rowMap[data]}</option>)}
		  </datalist>

          </div>
        </div>
    )
  }

}


export default Search;

