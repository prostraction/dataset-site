import * as React from "react";

export default class View extends React.Component {
    render() {
        return (
            <div className="view">
                <div className="view-wrapper">
                    <h2> Листья </h2>
                    <div className="imagesPreview">
                        <img src="/img/1.jpg" width="300"></img>
                        <img src="/img/2.jpg" width="300"></img>
                        <img src="/img/3.jpg" width="300"></img>
                    </div>
                    <ul>
                        <li>Обновлено 03.07.2023 в 15:00</li>
                        <li>Количество фотографий: 666</li>
                        <li>Разрешение (px): 1000x1000</li>
                        <li>ISO: в зависимости от сцены</li>
                        <li>aRGB</li>
                        <li>.png</li>
                    </ul>
                    <button>
                        Скачать
                    </button>
                </div>
            </div>
        );
    }
}