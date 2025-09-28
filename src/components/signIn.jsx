import React from "react";
import { encode as base64_encode } from 'base-64';

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = { login: '', password: '' };
    this.handleType = this.handleType.bind(this);
    this.handleFormInput = this.handleFormInput.bind(this);
  }

  handleType(event) {
    const target = event.target;
    if (target.id === "login") {
      this.setState({ login: target.value });
    } else if (target.id === "password") {
      this.setState({ password: target.value });
    }
  }

  handleFormInput(event) {
    event.preventDefault();
    if (this.state.login.length > 0 && this.state.password.length > 0) {
      const formData = { 
        login: this.state.login, 
        password: base64_encode(this.state.password) 
      };
      
      fetch("http://127.0.0.1:9999/auth/", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: new Headers({
          "Content-Type": "application/json",
          "type": "formData"
        }),
      })
      .then(response => response.json())
      .then((result) => {
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('authorized', 'true');
        localStorage.setItem('user_name', this.state.login);
        
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/';
      })
      .catch(() => {
        alert("Wrong username or password");
      });
    }
  }

  render() {
    return (
      <div className="auth">
        <p><strong>Authorization</strong></p>
        <form onSubmit={this.handleFormInput}>
          <ul>
            <li>
              <input 
                placeholder="Login" 
                id="login" 
                value={this.state.login} 
                onChange={this.handleType}
              />
            </li>
            <li>
              <input 
                placeholder="Password" 
                id="password" 
                value={this.state.password} 
                onChange={this.handleType} 
                type="password"
              />
            </li>
            <button type="submit">Sign In</button>
          </ul>
        </form>
      </div>
    );
  }
}