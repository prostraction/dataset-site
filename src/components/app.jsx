import * as React from "react";
import { BrowserRouter as Rounter, Routes, Route } from "react-router-dom";
import Menu from "./menu.jsx";
import View from "./viewDS.jsx";
import AddDS from "./addDS.jsx";
import SignIn from "./signIn.jsx";

export class App extends React.Component {

  render() {
    return (
      <Rounter>
        <div className="wrapper">
            <Routes>
              <Route exact path='/' element={<Menu></Menu>}></Route>
              <Route exact path='/set/:name' element={<><Menu></Menu><View></View></>}></Route>
              <Route exact path='/add' element={<><Menu></Menu><AddDS></AddDS></>}></Route>
              <Route exact path='/auth' element={<SignIn></SignIn>}></Route>
            </Routes>
        </div>
      </Rounter>
    );
  }
}

/*

<React.Fragment>
              <Menu></Menu>
          </React.Fragment>

          */