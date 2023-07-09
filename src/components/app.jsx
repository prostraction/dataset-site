import * as React from "react";
import { BrowserRouter as Rounter, Routes, Route } from "react-router-dom";
import Menu from "./menu.jsx";
import View from "./viewDS.jsx";
import AddDS from "./addDS.jsx";

export class App extends React.Component {

  render() {
    return (
      <Rounter>
        <div className="wrapper">
          <React.Fragment>
              <Menu></Menu>
          </React.Fragment>
           
            <Routes>
              <Route exact path='/set/:name' element={<View></View>}></Route>
              <Route exact path='/add' element={<AddDS></AddDS>}></Route>
            </Routes>
        </div>
      </Rounter>
    );
  }
}
