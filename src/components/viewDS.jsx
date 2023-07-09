import * as React from "react";
import InputDS from "./inputDS";

export default class View extends React.Component {
    constructor() {
        super();
        this.state = {
            dbJson: null,
            photos: [null],
            file: null,
            oldDatasetName: null,
            isLoaded: false,
            isEditing: false,
            cancelledState: null
        };
        this.editToggle = this.editToggle.bind(this);
    }

    componentDidMount() {
        const idName = window.location.href.split('/')[4];
        console.log(idName);
        if (idName.length > 0) {
                fetch('http://127.0.0.1:9999/getDataset?' + new URLSearchParams({
                name: idName,
            }))
            .then(response => response.json())
            .then((json) => {
                this.setState({
                    dbJson: json,
                    oldDatasetName: json.name.Name,
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
            case "imagePreviewName": return false
            case "downloadLink": return false
            default:
                return true
        }
    }

    editToggle(firstOpen) {
        if (firstOpen) {
            this.backupState = JSON.parse(JSON.stringify(this.state));
            this.backupState.cancelledState = null;
            this.editing = this.state.isEditing
            this.setState({
                cancelledState: this.backupState,
                isEditing: !this.editing
            });
        } else {
            this.editing = this.state.isEditing;
            this.backupState = this.state.cancelledState;
            this.setState({
                dbJson: this.backupState.dbJson,
                photos: this.backupState.photos,
                file: this.backupState.file,
                cancelledState: null,
                isLoaded: this.backupState.isLoaded,
                isEditing: !this.editing
            })
        }
        console.log(this.state);
    }

    updateJSONtoServer() {
        if (this.state.dbJson != null) {
            fetch("http://127.0.0.1:9999/putJSON?" + new URLSearchParams({
                name: this.state.oldDatasetName,
            }), {
              method: "PUT",
              body: JSON.stringify(this.state.dbJson),
              headers: new Headers({ "Content-Type": "application/json" }),
            });
            return true;
          }
          return false;
    }

    updatePhotosToServer() {

    }

    updateFileToServer() {

    }

    handleSubmit() {
        this.updateJSONtoServer();
    }

    render() {
        const idName = window.location.href.split('/')[4];
        const {dbJson, isLoaded, isEditing} = this.state;
        if (!isLoaded) {
            return (
                <div className="view">
                    <div className="view-wrapper">

                    </div>
                </div>
            )
        } else {
            if (isEditing) {
                return (
                    <div className="view">
                        <InputDS edit={this.state}></InputDS>
                        <button onClick={() => {
                            this.handleSubmit()
                        }}>
                                Сохранить изменения
                        </button>
                        <button onClick={() => {
                            this.editToggle(false)
                        }}>Выйти
                        </button>
                    </div>
                )
                
            } else {
                return (
                    <div className="view">
                        <div className="view-wrapper">
                            <h2>{dbJson.name.Value}</h2>
                            <div className="imagesPreview">
                                {Object.entries(dbJson.imagePreviewName).map((key) => (
                                        <img key={key[1].Name} alt={key[1].Name} src={key[1].Value} height="300" width="300"></img>
                                    ))}
                            </div>
                            <ul>
                                <li key ={"dbJson datetime"}>{dbJson.date.Name} {dbJson.date.Value} {dbJson.time.Name} {dbJson.time.Value}</li>
                                {Object.entries(dbJson).filter(([k, _]) => this.readableData(k)).map((key) => (
                                    <li key={key[0]}>{key[1].Name} {key[1].Value}</li>
                                ))}
                            </ul>
                            <button>
                                <a href = {dbJson.downloadLink.Value}>{dbJson.downloadLink.Name}</a>
                            </button>
                            <p></p>
                            <button onClick={() => {
                                this.editToggle(true)
                            }}>Редактировать
                            </button>
                        </div>
                    </div>
                );
            }
        }
    }
}