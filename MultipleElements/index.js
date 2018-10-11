import React from 'react';
import IconClose from 'arui-feather/icon/ui/close';
import IconButton from 'arui-feather/icon-button';
import _ from 'lodash';
import InputAutocomplete from 'arui-feather/input-autocomplete';
import "./index.css";
const DELAY = 1500;

const styleTag ={
	backgroundColor: "rgba(11, 31, 53, 0.05)",
	padding:  "5px 10px",
	borderRadius: "8px",
	color: "rgba(11, 31, 53, .95)",
	display:"inline-block",
	marginRight:"5px",
	marginTop:"5px",
	paddingRight:"5px",
	fontSize: "14px",
};
class BpmMultiplySelect extends React.Component {

 constructor(props) {
    super(props);
    this.state = {
  		color:"",
		value:"",
		values:props.value,
		label:props.label,
		userList:[],
		disabled:props.disabled,
	};
	this.handleListDispatchChange = _.debounce(this.handleListDispatchChange, DELAY);
  }

   componentWillReceiveProps(nextprops){
    this.setState({value: nextprops.value});
   }


    getFilteredOptions(list, typedValue) {
		console.log(typedValue);
		return [];
	}

	 handleItemSelect=(item)=> {
		let values = this.state.values || [];
		let tempArray = [];
		if (!values.includes(item.code)) {
			values.push(item.code);
			this.setState({value: '', values: values});
			this.props.store.dispatch({
				type: 'UPDATE_VALUE',
				propVal: values,
				propName: this.props.name
			});
		}
	}

	handleChange(value){
		this.setState({value:value});
		this.handleListDispatchChange(value);
	}

	handleListDispatchChange(val){
		let userList = [];
		let res = [{D_CODE:'asd',D_VALUE:'123'},{D_CODE:'qwe',D_VALUE:'213'},{D_CODE:'zxc',D_VALUE:'321'}];
		if (val.length > 2){
			return new Promise((resolve, reject) => {
				Service(
					//service call
				).then((res) => {
					for(let i=0;i<res.length;i++){
						let object = res[i];
						let tempObject = {'code':object.D_CODE, 'value':object.D_VALUE};
						userList.push(tempObject);
					}
					this.setState({userList});
					resolve(res);
				}, error => {
					reject(error);
				});
			}).catch((e) =>{
					console.error(e);
				});
		}
    }
 
	handleDeleteSelectItem=(value,event)=>{
		let filteredArray = this.state.values.filter(item => item !== value)
		this.setState({values: filteredArray},);
		this.props.store.dispatch({
			type: 'UPDATE_VALUE',
			propVal: filteredArray,
			propName: this.props.name
		});
		
	}

  render() {
     
        return (
		<div className="section">
			<InputAutocomplete
				value={ this.state.value }
				width='available'
				closeOnSelect={ true }
				onChange={(value)=>this.handleChange(value)}
				onItemSelect={(value)=> this.handleItemSelect(value)}
				updateValueOnItemSelect={ false }
				placeholder={this.state.label}
				options={ this.state.userList }
				disabled={this.state.disabled}
				
			/>

			<div style={ { marginTop: '5px' } }>
				{ this.state.values && this.state.values.map(item => <span style={styleTag}>{ item }<IconButton disabled={this.state.disabled} className="bpm-icon-button" onClick={this.handleDeleteSelectItem.bind(this,item)} size='s'>
						<IconClose size={ "s" } />
					</IconButton></span>) }
			</div>
		</div>
        )
  }
}

export default BpmMultiplySelect;