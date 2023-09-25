import * as React from "react"

export default class SignIn extends React.Component {

    render() {
        return(
                <div className="auth">
                    <p><strong>Авторизация</strong></p>
                    <form>
                        <ul>
                        <li><input placeholder="Логин"></input></li>
                        <li><input placeholder="Пароль"></input></li>
                        <button>Войти</button>
                        </ul>
                    </form>
                </div>
        )
    }
}

