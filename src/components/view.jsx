import * as React from "react";

export default class View extends React.Component {
    constructor() {
        super()
        this.state = {
            isLoaded: false
        }
    }

    componentDidMount() {
        fetch('http://127.0.0.1:9999/dataset?' + new URLSearchParams({
            name: 'TreeLeafsDirty',
        }))
        .then(response => response.json())
        .then((json) => {
            this.setState({
                dataset: json,
                isLoaded: true,
            })
        });
    }

    render() {
        const {dataset, isLoaded} = this.state;
        if (!isLoaded) {
            return (
                <div className="errorView">
                    <div>
                        <p>Выберите датасет из списка</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="view">
                    <div className="view-wrapper">
                        <h2>{dataset.name.Value}</h2>
                        <div className="imagesPreview">
                            <img src="/img/1.jpg" width="300"></img>
                            <img src="/img/2.jpg" width="300"></img>
                            <img src="/img/3.jpg" width="300"></img>
                        </div>
                        <ul>
                            <li>{dataset.date.Name} {dataset.date.Value} {dataset.time.Name} {dataset.time.Value}</li>
                            {Object.entries(dataset).filter(([k, _]) => k !== "date" && k !== "time" && k !== "name").map((key) => (
                                <li key={key[0]}>{key[1].Name} {key[1].Value}</li>
                            ))}
                        </ul>
                        <button>
                            Скачать
                        </button>
                    </div>
                </div>
            );
        }
    }
}