import * as React from "react";
import InputDS from "./inputDS";

export default class View extends React.Component {
    constructor() {
        super();
        this.state = {
            dbJson: null,
            dbJsonOld: null,
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
                    dbJsonOld: JSON.parse(JSON.stringify(json)),
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
            this.photos = [];
            Object.entries(this.state.dbJson.imagePreviewName).map((key) => (
                this.photos.push("images/" + this.state.dbJsonOld.name.Name + "/" + key[1].Value)
            ));
            this.photos.push("images/_/add.svg");
            this.backupState = JSON.parse(JSON.stringify(this.state));
            this.backupState.cancelledState = null;
            this.editing = this.state.isEditing
            this.setState({
                photos: this.photos,
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
    }

    updateJSONtoServer() {
        if (this.state.dbJson != null) {
            this.fileChanged = (this.state.file === null) ? "no" : "yes";
            console.log(this.fileChanged, this.file)
            fetch("http://127.0.0.1:9999/putJSON?" + new URLSearchParams({
                oldName: this.state.dbJsonOld.name.Name,
                newName: this.state.dbJson.name.Name,
                fileChanged: this.fileChanged
            }), {
              method: "PUT",
              body: JSON.stringify(this.state.dbJson),
              headers: new Headers({ "Content-Type": "application/json" }),
            })
            .then(() => {
                this.updateFileToServer();
                this.updatePhotosToServer();
            });
            return true;
          }
          return false;
    }

    updatePhotosToServer() {
        for (let i = 0; i < this.state.photos.length; i++) {
            if (this.state.photos[i] !== null) {
              this.photo = this.state.photos[i];
              const formData = new FormData();
              formData.append("photo", this.photo);
              fetch("http://127.0.0.1:9999/postPhoto?" + new URLSearchParams({
                name: this.state.dbJson.name.Name,
              }), {
                method: "POST",
                body: formData,
              });
            }
          }
    }

    updateFileToServer() {
        this.file = this.state.file;
        if (this.file != null && this.state.dbJson != null) {
          const formData = new FormData();
          formData.append("upload", this.file );
          fetch("http://127.0.0.1:9999/postFile?" + new URLSearchParams({
            name: this.state.dbJson.name.Name
          }), {
            method: "POST",
            body: formData,
          });
        }
    }

    handleSubmit() {
        if (this.updateJSONtoServer()) {
            //this.updatePhotosToServer();

            if (this.state.dbJson.name.Name === this.state.oldDatasetName) {
                this.editing = this.state.isEditing
                this.setState({
                    isEditing: !this.editing
                });
            } else {
                /* force redirect */
            }
        }
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
                                        <img key={key[1].Name} alt={key[1].Name} src={"http://127.0.0.1:9999/images/" + this.state.dbJsonOld.name.Name + "/" + key[1].Value} height="300" width="300"></img>
                                    ))}
                            </div>
                            <ul>
                                <li key ={"dbJson datetime"}>{dbJson.date.Name} {dbJson.date.Value} {dbJson.time.Name} {dbJson.time.Value}</li>
                                {Object.entries(dbJson).filter(([k, _]) => this.readableData(k)).map((key) => (
                                    <li key={key[0]}>{key[1].Name} {key[1].Value}</li>
                                ))}
                            </ul>
                            <button>
                                <a href = {"http://127.0.0.1:9999/downloads/" + dbJson.name.Name + "/" + dbJson.downloadLink.Value}>{dbJson.downloadLink.Name}</a>
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