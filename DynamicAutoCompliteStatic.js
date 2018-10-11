import React, { Component } from 'react';
import InputAutocomplete from 'arui-feather/input-autocomplete';

class DynamicAutoCompliteStatic extends Component {

    constructor(props){
        super(props);
        this.state={
            value : '',
            data : {},
            USER_LOGIN : "",
            options:[],
            disabled : props.disabled,
            label : props.label,
            multi : false,
            dictName : props.dict,
            validateClass : "test",
            errorTextLocal: "",
            isStatic: false,
        };
    }

    async componentWillMount(){
        if (!this.props.disabled){
            this.setState({isStatic: this.props.value.is_static});
            await this.getValsForStaticDict();
        }
    }
  
    componentDidMount(){
        let data = this.state.data;
        if (this.props.value){
            data['D_CODE'] = this.props.value? this.props.value.D_CODE: '';
            data['D_VALUE'] = this.props.value? this.props.value.D_VALUE: '';
            this.setState({value: this.props.value, data});
        }
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.disabled !== this.props.disabled){
            this.getValsForStaticDict();
        }
    }

    getValsForStaticDict(){
        let options = [];
        return new Promise((resolve, reject) => {
            Service(
                //service call
            ).then((retVal) => {
                for(let i=0;i<retVal.RESPONSE.length;i++){
                    let object = retVal.RESPONSE[i];
                    let tempObject = {'code':object.D_CODE, 'value':object.D_VALUE};
                    options.push(tempObject);
                }
                this.setState({options});
                resolve(retVal);
            });
        });
    }

    handleItemSelect=(value) =>{
        let data = this.state.data;
        data['D_CODE'] = value.code;
        data['D_VALUE'] = value.value;
        this.props.store.dispatch({
            type: 'UPDATE_COMPLEX_VALUE',
            propVal: this.state.data,
            propName: this.props.name
        });
        this.setState({data,});
    }

    handleChange=(value)=> {
        if (!this.props.value.is_static){
            let data = this.state.data;
            data['D_VALUE'] = value.value;
            this.setState({value: value,USER_LOGIN:"",data});

            this.props.store.dispatch({
                type: 'UPDATE_VALUE',
                propVal: this.state.data,
                propName: this.props.name
            });
        }
    }


    handleDelete=()=>{
        this.props.handleDelete(this.props.index);
    }

  render() {
    return (
      <div className="section">
        <InputAutocomplete disabled={this.props.disabled} closeOnSelect={ true } width='available' size='m' options={this.state.options}  value={this.state.data['D_VALUE']?this.state.data['D_VALUE']:''}  label={this.state.label} onItemSelect={(value)=>this.handleItemSelect(value)} />
      </div>
    );
  }
}

export default DynamicAutoCompliteStatic;
