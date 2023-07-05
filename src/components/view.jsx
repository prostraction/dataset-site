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

    readableData(givenStr) {
        switch (givenStr) {
            case "date": return false
            case "time": return false
            case "name": return false
            case "imagePreviewName1": return false
            case "imagePreviewName2": return false
            case "imagePreviewName3": return false
            case "downloadLink": return false
            default:
                return true
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
                            <img alt={dataset.imagePreviewName1.Value} src={dataset.imagePreviewName1.Value} height="300" width="300"></img>
                            <img alt={dataset.imagePreviewName2.Value} src={dataset.imagePreviewName2.Value} height="300" width="300"></img>
                            <img alt={dataset.imagePreviewName3.Value} src={dataset.imagePreviewName3.Value} height="300" width="300"></img>
                        </div>
                        <ul>
                            <li>{dataset.date.Name} {dataset.date.Value} {dataset.time.Name} {dataset.time.Value}</li>
                            {Object.entries(dataset).filter(([k, _]) => this.readableData(k)).map((key) => (
                                <li key={key[0]}>{key[1].Name} {key[1].Value}</li>
                            ))}
                        </ul>
                        <button>
                            <a href = {dataset.downloadLink.Value}>{dataset.downloadLink.Name}</a>
                        </button>
                    </div>
                </div>
            );
        }
    }
}