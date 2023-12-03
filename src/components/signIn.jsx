import * as React from "react"
import {encode as base64_encode} from 'base-64';

export default class SignIn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {login: '', password: ''};
        this.handleType = this.handleType.bind(this);
        this.handleFormInput = this.handleFormInput.bind(this);
    }

    handleType(event) {
        const target = event.target;
        if (target.id === "login") {
            this.setState({login: target.value});
        } else if (target.id === "password") {
            this.setState({password: target.value});
        }
    }

    handleFormInput(event) {
        event.preventDefault();
        if (this.state.login.length > 0 && this.state.password.length > 0) {
            const formData = {login: this.state.login, password: base64_encode(this.state.password)};
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
            })
            .catch(() => {
                alert("Wrong username or password");
            });
        }
    }

    render() {
        return(
                <div className="auth">
                    <p><strong>Авторизация</strong></p>
                    <form>
                        <ul>
                        <li><input placeholder="Логин" id="login" value={this.state.login} onChange={this.handleType}></input></li>
                        <li><input placeholder="Пароль" id="password" value={this.state.password} onChange={this.handleType} type="passwordword"></input></li>
                        <button onClick={this.handleFormInput}>Войти</button>
                        </ul>
                    </form>
                </div>
        )
    }
}

