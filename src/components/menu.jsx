// menu.jsx
import React from "react";
import { Link } from "react-router-dom";

export default class Menu extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoaded: false,
      names: null,
      isAuthorized: false
    };
  }

  componentDidMount() {
    this.checkAuthStatus();
    
    fetch("http://127.0.0.1:9999/getList/")
      .then((response) => response.json())
      .then((json) => {
        this.setState({
          names: json,
          isLoaded: true,
        });
      })
      .catch(error => {
        console.error("Error loading datasets:", error);
        this.setState({ isLoaded: true });
      });

    window.addEventListener('storage', this.checkAuthStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.checkAuthStatus);
  }

  checkAuthStatus = () => {
    const isAuthorized = localStorage.getItem('authorized') === 'true';
    const accessToken = localStorage.getItem('access_token');
    
    this.setState({
      isAuthorized: !!isAuthorized && !!accessToken
    });
  }

  render() {
    const { names, isLoaded, isAuthorized } = this.state;

    if (!isLoaded) {
      return (
        <div className="menu">
          <h3>DATASETS</h3>
          <div>Loading...</div>
        </div>
      );
    }

    return (
      <div className="menu">
        <h3>DATASETS</h3>
        <ul>
          <li className="menuCategory">Uncategorized</li>
          <li>
            <ul>
            {names && Object.keys(names).length > 0 ? (
              Object.keys(names).map((k) => (
                <li key={k}>
                  <Link to={"/set/" + names[k].name.Name}>
                    {names[k].name.Value}
                  </Link>
                </li>
              ))
            ) : (
              <li>No datasets available</li>
            )}
            </ul>
          </li>
          {isAuthorized && (
            <React.Fragment>
              <li className="menuCategory">Actions</li>
              <li key="addDataSet">
                <Link to="/add">Create a dataset</Link>
              </li>
            </React.Fragment>
          )}
        </ul>
      </div>
    );
  }
}