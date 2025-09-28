import React from "react";
import { Link } from "react-router-dom";

export default class Header extends React.Component {
    constructor() {
        super();
        this.state = {
            isAuthorized: false,
            username: ''
        };
    }

    componentDidMount() {
        this.checkAuthStatus();
        window.addEventListener('storage', this.checkAuthStatus);
    }

    componentWillUnmount() {
        window.removeEventListener('storage', this.checkAuthStatus);
    }

    checkAuthStatus = () => {
        const isAuthorized = localStorage.getItem('authorized') === 'true';
        const accessToken = localStorage.getItem('access_token');
        const username = localStorage.getItem('username') || '';
        
        this.setState({
            isAuthorized: !!isAuthorized && !!accessToken,
            username
        });
    }

    handleSignOut = () => {
        localStorage.removeItem('authorized');
        localStorage.removeItem('access_token');
        localStorage.removeItem('username');
        this.setState({
            isAuthorized: false,
            username: ''
        });
        window.location.href = '/';
    }

    render() {
        const { isAuthorized, username } = this.state;

        return (
            <header className="header">
                <div className="header-nav">
                    <Link to="/" className="logo">qoph.org</Link>
                    
                    <div className="header-menu">
                        <ul>
                            <li><Link to="/">Datasets</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>
                    
                    <div className="header-auth">
                        {isAuthorized ? (
                            <div className="user-info">
                                <span>{username}</span>
                                <button onClick={this.handleSignOut}>Sign Out</button>
                            </div>
                        ) : (
                            <Link to="/signin">Sign In</Link>
                        )}
                    </div>
                </div>
            </header>
        );
    }
}