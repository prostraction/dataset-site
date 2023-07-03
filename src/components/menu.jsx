import * as React from "react";

export default class Menu extends React.Component {
  render() {
    return (
      <div className="menu">
        <h2>Датасеты</h2>
        <ul>
          <li>Листья (с фоном)</li>
          <li>Листья (без фона)</li>
          <li>Шумы ISO 12800</li>
          <li>Шумы ISO 6400</li>
        </ul>
      </div>
    );
  }
}
