import * as React from "react";

export default class Menu extends React.Component {
 constructor() {
    super();
    this.state = {
        isLoaded: false
    };
 }

 componentDidMount()  {
    fetch('http://127.0.0.1:9999/list')
    .then(response => response.json())
    .then((json) => {        
        this.setState({
            names: json,
            isLoaded: true,
        })
    });
 }

  render() {
    const {names, isLoaded} = this.state;
    if (!isLoaded) {
        return (<div className="menu"><h2>Датасеты</h2></div>)
    } else {
        return (
            <div className="menu">
              <h2>Датасеты</h2>
              <ul>
                {Object.keys(names).map((k) => (
                    <li key={names[k].name.Name}><a href={"/ds/" + names[k].name.Name}>{names[k].name.Value}</a></li>   
                ))}
                <li key="addDataSet"><a href={"/add"}>Добавить датасет</a></li>
              </ul>
            </div>
          );
    }
    
  }
}