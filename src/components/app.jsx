import * as React from "react";
import Menu from "./menu.jsx";
import View from "./view.jsx";

export class App extends React.Component {

  render() {
    return (
      <div className="wrapper">
        <React.Fragment>
            <Menu></Menu>
        </React.Fragment>
        
         <React.Fragment>
           <View></View>
         </React.Fragment>
      </div>
    );
  }
}