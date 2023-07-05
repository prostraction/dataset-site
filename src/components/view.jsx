import * as React from "react";

export default class View extends React.Component {
    constructor() {
        super();
        this.state = {
            isLoaded: false
        };
    }

    componentDidMount() {
        const idName = window.location.href.split('/')[4];
        console.log(idName);
        if (idName.length > 0) {
                fetch('http://127.0.0.1:9999/dataset?' + new URLSearchParams({
                name: idName,
            }))
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    dataset: json,
                    isLoaded: true,
                })
            });
        }
    }

    render() {
        const idName = window.location.href.split('/')[4];
        const {dataset, isLoaded} = this.state;
        if (!isLoaded) {
            return (
                <div className="view">
                    <div className="view-wrapper">

                    </div>
                </div>
            )
        } else {
            return (
                <div className="view">
                    <div className="view-wrapper">
                        <h2>{dataset.name.Value}</h2>
                        <div className="imagesPreview">
                            <img alt="Element 1" src={"/img/"+idName+"/1.jpg"} width="300"></img>
                            <img alt="Element 2" src={"/img/"+idName+"/2.jpg"} width="300"></img>
                            <img alt="Element 3" src={"/img/"+idName+"/3.jpg"} width="300"></img>
                        </div>
                        <ul>
                            <li>{dataset.date.Name} {dataset.date.Value} {dataset.time.Name} {dataset.time.Value}</li>
                            {Object.entries(dataset).filter(([k, _]) => k !== "date" && k !== "time" && k !== "name").map((key) => (
                                <li key={key[0]}>{key[1].Name} {key[1].Value}</li>
                            ))}
                        </ul>
                        <button>
                            <a href = {"/dataset/" + idName + ".zip"}>Скачать</a>
                        </button>
                    </div>
                </div>
            );
        }
    }
}