import React,{Component} from 'react';
import Textarea from 'arui-feather/textarea';


class TextField extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            errorTextLocal : "",
            value : '',
            disabled : props.disabled,
            label : props.label,
        }
    }

    componentDidMount(){
        this.setState({value: this.props.value});
    }

    componentDidUpdate(prevProps){
        if (!this.props.value && prevProps.value){
            this.setState({value: ''});
        }
    }

    handleBlur (){
        if (this.props.error && !this.props.value){
            this.setState({errorTextLocal: this.props.error});
        }
        else{
            this.setState({errorTextLocal: ""});
        }
    }
    getErrorTxt(){
        if (this.state.errorText){
            return this.state.errorText;
        }
        else{
            return null;
        }
    }

    handleChange = (value) => {
        this.setState({value: value});
        
        this.props.store.dispatch({
                                    type: 'UPDATE_VALUE',
                                    propVal: value,
                                    propName: this.props.name
                                   });
    }

    render() {
        return (<Textarea value={this.state.value} disabled={this.props.disabled} label={this.state.label} width="available" onChange={this.handleChange}/>)
    }
}

export default TextField;