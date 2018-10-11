import React,{Component} from 'react';
import MenuItem from 'arui-feather/menu-item';
import SlideDown from 'arui-feather/slide-down';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';


let location = '';
let sentRequest = 0;

class CategoryList extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            isLoading:true,
            isExpanded: false,
            isExpanded1: {},
        };

        sentRequest = 0;
    }

    getData(){
        return new Promise(async function (resolve,reject){
            //let catList = await this.getCategoryList();

            function getCategoryList(){
                return new Promise((resolve, reject) => {
                    Service(
                        //Service call
                    ).then((retValue) => {
                        resolve(retValue);
                    });
                }).catch((e) =>{
                        console.error(e);
                    });
            }

            function getUserGroups(){
                return new Promise( function (resolve, reject ) {
                    if (window.Service) {
                      Service(
                        //Service call
                      )
                        .then(result => {
                          resolve(result);
                        }, error => {
                          reject(error);
                        });
                    } else {
                      reject('Liferay is not a function');
                    }
                  });
            }
            let executeFunctions = await Promise.all([getCategoryList(),getUserGroups()]);
            resolve(executeFunctions);
        });
    }

    async componentWillMount(){
        let data = await this.getData();
        let catList = data[0];
        let groupList = data[1]; 
        let usrId = window.Liferay.ThemeDisplay.getUserId();
        let isExpanded1 = {};

        for(let i in catList){
            isExpanded1['status_'+catList[i].ID] = false;
        }

        this.props.dispatch({
            type: 'SET_USER',
            userId: usrId,
            rolesArr: groupList
          });

        this.props.dispatch({
        type: 'ADD_CATEGORY',
        items: catList
          });

        this.setState({isLoading:false,isExpanded1:isExpanded1},console.info('isExpanded1',this.state.isExpanded1));
        
        location = this.props.location.pathname;

        let urlValue = window.location.href.split('#/')[1];
        this.sendRequestToSecondPortlet(urlValue);
    }

    sendRequestToSecondPortlet(urlValue){
        let user = this.props.user;
        if (urlValue && sentRequest == 0){
            //check if its a details portlet
            let catId = urlValue.split('/')[0];
            let detId = urlValue.split('/')[1];
            let parentCategory = this.props.availableCategory.find(cat => cat.ID === parseInt(catId));
      
            let childCategory = {};
            if (!parentCategory){
                childCategory = this.checkChild(this.props.availableCategory,catId);
            }
            let category = parentCategory ? parentCategory : childCategory ? childCategory : undefined;
            if (Object.keys(category) && Object.keys(category).length > 0){
                let parameters = {user: user, categoryId: category.ID, categoryName: category.NAME, creatorGroups: category.creator_groups, editorGroups: category.editor_groups, categoryCode:category.CODE};

                if (detId){
                    //call third portlet
                    let rowInfo = {ID:detId};
                    let tempCategory = {categoryId:category.ID, categoryName:category.NAME, creatorGroups: category.creator_groups, editorGroups: category.editor_groups, categoryCode:category.CODE};
                    window.Liferay.fire('showPortletByName',{portletName:'documents-lib-detail-info'});
                    window.Liferay.fire('showDetailedInfo',{rowInfo:rowInfo, user:user, category:tempCategory});
                }
                else if (catId){
                    //call second portlet
                    window.Liferay.fire('ShowCategory',parameters);
                    window.Liferay.fire('showPortletByName',{portletName:'documents-lib-description'});
                }
                sentRequest = 1;
            }
        }
    }

    checkChild(cats, catId){
        let res = {};
        if (cats && cats.length > 0){
            for (var i=0;i<cats.length;i++){
                if (cats[i].CHILDS && cats[i].CHILDS.length > 0){
                    res = this.checkChild(cats[i].CHILDS,catId);
                    if (Object.keys(res) && Object.keys(res).length > 0){
                        break;
                    }
                }else{
                    if (cats[i].ID === parseInt(catId)){
                        res = cats[i];
                        break;
                    }
                }
            }
        }
        return res;
    }

    componentDidUpdate(prevProps){
        let urlValue = window.location.href.split('#/')[1];
        //load data (send requests) only if path has changed
        if (this.props.router.location.pathname !== location){
            location = this.props.router.location.pathname;
            this.sendRequestToSecondPortlet(urlValue);
        }
    }

    handleClickLink(id,name,user,code,creatorGroups,editorGroups,disabled,event){
        if(!disabled){
            let parameters = {user: user,categoryId:id, categoryName:name, creatorGroups: creatorGroups, editorGroups: editorGroups, categoryCode:code};
            hashHistory.push('/' + id);
            window.Liferay.fire('ShowCategory',parameters);
            window.Liferay.fire('showPortletByName',{portletName:'documents-lib-description'});
            
        }
    }

    getavariableCategories(){
        let cats = [];
        let categoryTemp={};
        let gr = 0;
        let ursRoles = this.props.user.userRoles;
        let categories = this.props.category;
        categories.forEach(cat=>{
            categoryTemp = {ID:cat.ID, NAME:cat.NAME, CODE:cat.CODE, isHasChild:cat.isHasChilds, CHILDS:cat.CHILDS, reader_groups: cat.reader_groups, creator_groups: cat.creator_groups, editor_groups: cat.editor_groups,disabled:true}; 
            
            for (i=0; i< cat.reader_groups.length; i++){
                if (ursRoles.indexOf(cat.reader_groups[i].name) != -1||cat.reader_groups[i].name.indexOf('All_Users')!= -1){
                    categoryTemp['disabled'] = false;
                    break;
                } 
            }
            cats.push(categoryTemp);
        });

        this.props.dispatch({
            type: 'ADD_AVAILABLE_CATEGORY',
            items: cats
        });
        
        return cats;
    }
    handleSlideDownToggle=(index,event)=> {
        let isExpanded1 = this.state.isExpanded1;

        isExpanded1['status_'+index] = !this.state.isExpanded1['status_'+index];

        this.setState({ isExpanded:!this.state.isExpanded,isExpanded1});
    }
    handleClickTest(){
        console.info('info',);
    }


    render() {
        let categoriesAvailable = this.getavariableCategories();
        let user = this.props.user;
        let isExpandedArray = this.state.isExpanded1;

        function GetChildCategories(props){
            let childs = props.childs.sort(function (a, b) {
                if (a.NAME > b.NAME) {
                  return 1;
                }
                if (a.NAME < b.NAME) {
                  return -1;
                }
                return 0;
              });;
            
            return (<div className='child-category'>
            <SlideDown isExpanded={ isExpandedArray['status_'+props.isExpandedId] }>
                   {childs.map(function(item){
                       let disabled = true;
                       if(item.reader_groups.length>0)
                       for (i in item.reader_groups) 
                           if (props.user.userRoles.indexOf(item.reader_groups[i].name) !== -1 || item.reader_groups[i].name.indexOf('All_Users') != -1) 
                                disabled  = false;
                
                        return  <div>  
                                    <MenuItem
                                            type='block'
                                            size='s'
                                            className={disabled ? 'category-item-disabled child-category-item' : 'child-category-item'}
                                            disabled={disabled}
                                            onClick={item.CHILDS.length>0?props.handleSlideDownToggle.bind(this,item.ID):props.handleClickLink.bind(this,item.ID,item.NAME,props.user,item.CODE,item.creator_groups, item.editor_groups, false)}                                
                                        >
                                            {item.NAME}
                                        </MenuItem>
                                        {item.CHILDS.length>0?<GetChildCategories user={props.user} isExpandedId={item.ID} childs={item.CHILDS} handleClickLink={props.handleClickLink}  />:null}
                                </div>
                    },props)
            }
            </SlideDown>
      </div>);

        }
        return (
            this.props.category.length > 0 && Object.keys(this.props.user).length != 0 && !this.state.isLoading? 
            <ul>
                {categoriesAvailable.map(function(item){
                     return <li key={item.ID}> 
                             <span className='row' key={ 'm' }>
                                 <div className='column'>
                                     <MenuItem
                                        type='block'
                                        size='l'
                                        className={item.disabled ? 'parent-category-item category-item-disabled' : 'parent-category-item'}
                                        disabled={item.disabled}
                                        onClick={item.isHasChild?this.handleSlideDownToggle.bind(this,item.ID):this.handleClickLink.bind(this, item.ID,item.NAME,user,item.CODE,item.creator_groups, item.editor_groups, item.disabled)}
                                     >
                                     {item.NAME}
                                     </MenuItem>
                                     {item.isHasChild?<GetChildCategories user={user}  handleSlideDownToggle={this.handleSlideDownToggle} isExpandedId={item.ID} childs={item.CHILDS} handleClickLink={this.handleClickLink}  />:null}

                                 </div>
                             </span>
                         </li>
                     },this)
                
                }
            </ul>:
             <div>Загрузка категорий</div>
            )
    }
}

function mapStateToProps (state) {
    return {
      user:                 state.user,
      category:             state.category,
      availableCategory:    state.availableCategory
    }
  }

  export default connect(mapStateToProps) (CategoryList);