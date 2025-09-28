import React from "react";
import InputDS from "./inputDS";
import { withRouter } from "./withRouter";

class ViewDS extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dbJson: null,
            dbJsonOld: null,
            photos: [null],
            file: null,
            oldDatasetName: null,
            isLoaded: false,
            isEditing: false,
            cancelledState: null,
        };
        this.editToggle = this.editToggle.bind(this);
    }

    componentDidMount() {
        this.loadDataset();
    }

    componentDidUpdate(prevProps) {
        if (this.props.params.datasetId !== prevProps.params.datasetId) {
            this.loadDataset();
        }
    }

    loadDataset() {
        const idName = this.props.params.datasetId;
        console.log("Loading dataset:", idName);
        if (idName && idName.length > 0) {
            fetch(
                "http://127.0.0.1:9999/getDataset?" +
                new URLSearchParams({
                    name: idName,
                })
            )
                .then((response) => response.json())
                .then((json) => {
                    this.setState({
                        dbJson: json,
                        dbJsonOld: JSON.parse(JSON.stringify(json)),
                        oldDatasetName: json.name.Name,
                        isLoaded: true,
                        isEditing: false
                    });
                })
                .catch(error => {
                    console.error("Error loading dataset:", error);
                    this.setState({ isLoaded: true });
                });
        }
    }

    readableData(givenStr) {
        switch (givenStr) {
            case "date":
                return false;
            case "time":
                return false;
            case "name":
                return false;
            case "imagePreviewName":
                return false;
            case "downloadLink":
                return false;
            case "description":
                return false;
            case "category":
                return false;
            default:
                return true;
        }
    }

    editToggle(firstOpen) {
        if (firstOpen) {
            this.photos = [];
            Object.entries(this.state.dbJson.imagePreviewName).map((key) =>
                this.photos.push(
                    "images/" + this.state.dbJsonOld.name.Name + "/" + key[1].Value
                )
            );
            this.photos.push("images/_/add.svg");
            this.backupState = JSON.parse(JSON.stringify(this.state));
            this.backupState.cancelledState = null;
            this.editing = this.state.isEditing;
            this.setState({
                photos: this.photos,
                cancelledState: this.backupState,
                isEditing: !this.editing,
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
                isEditing: !this.editing,
            });
        }
    }

    updateJSONtoServer() {
        const formData = new FormData();
        if (this.state.dbJson != null) {
            this.fileChanged = this.state.file === null ? "no" : "yes";

            for (let i = 0; i < this.state.photos.length - 1; i++) {
                if (
                    this.state.photos[i] != null &&
                    typeof this.state.photos[i] === "object"
                ) {
                    this.photo = this.state.photos[i];
                    formData.append("photo", this.photo);
                }
            }

            if (this.state.file != null) {
                formData.append("upload", this.state.file);
            }

            formData.append("jsonDB", JSON.stringify(this.state.dbJson));
            const accessToken = localStorage.getItem("access_token");

            fetch(
                "http://127.0.0.1:9999/putJSON?" +
                new URLSearchParams({
                    oldName: this.state.dbJsonOld.name.Name,
                    newName: this.state.dbJson.name.Name,
                    fileChanged: this.fileChanged,
                }),
                {
                    method: "PUT",
                    body: formData,
                    headers: new Headers({
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                        type: "formData",
                    }),
                }
            )
                .then(() => {
                    this.editEdded();
                })
                .catch((error) => {
                    alert(error);
                });
            return true;
        }
        return false;
    }

    handleSubmit() {
        this.updateJSONtoServer();
    }

    editEdded() {
        if (this.state.dbJson.name.Name === this.state.oldDatasetName) {
            this.editing = this.state.isEditing;
            this.setState({
                isEditing: !this.editing,
            });
        } else {
            window.location.href = '/';
        }
    }

    render() {
        const { dbJson, isLoaded, isEditing } = this.state;

        if (!isLoaded) {
            return (
                <div className="view">
                    <div className="view-wrapper">Loading...</div>
                </div>
            );
        }

        if (isEditing) {
            return (
                <div className="view">
                    <div className="view-wrapper">
                        <InputDS edit={this.state}></InputDS>
                        <button onClick={() => { this.handleSubmit(); }}>
                            Save changes
                        </button>
                        <button onClick={() => { this.editToggle(false); }}>
                            Quit
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="view">
                <div className="view-wrapper">
                    <h2>{dbJson.name.Value}</h2>
                    <div className="imagesPreview">
                        {Object.entries(dbJson.imagePreviewName).map((key) => (
                            <img
                                key={key[1].Name}
                                alt={key[1].Name}
                                src={
                                    "http://127.0.0.1:9999/images/" +
                                    this.state.dbJsonOld.name.Name +
                                    "/" +
                                    key[1].Value
                                }
                                height="300"
                                width="300"
                            ></img>
                        ))}
                    </div>

                    <div className="description">
                        <p>{dbJson.description ? dbJson.description.Value : ""}</p>
                    </div>
                    <div className="actions">
                        <button>
                            <a
                                href={
                                    "http://127.0.0.1:9999/downloads/" +
                                    dbJson.name.Name +
                                    "/" +
                                    dbJson.downloadLink.Value
                                }
                            >
                                {"Download"}
                            </a>
                        </button>
                        <button onClick={() => { this.editToggle(true); }}>
                            Edit
                        </button>
                    </div>
                    <ul>
                        <li key={"dbJson datetime"}>
                            {dbJson.date.Name} {dbJson.date.Value} {dbJson.time.Name}{" "}
                            {dbJson.time.Value}
                        </li>
                        {Object.entries(dbJson)
                            .filter(([k, _]) => this.readableData(k))
                            .map((key) => (
                                <li key={key[0]}>
                                    {key[1].Name} {key[1].Value}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        );
    }
}

export default withRouter(ViewDS);