import * as React from "react";
import { BrowserRouter as Rounter, Routes, Route } from "react-router-dom";

export default class AddDS extends React.Component {
  static initialJson = {
        name: {
            Name: "Название датасета",
            Value: "Dataset name",
          },
          date: {
            Name: "Обновлено ",
            Value: "01.01.1970",
          },
          time: {
            Name: "в ",
            Value: "00:00",
          },
          count: {
            Name: "Количество фотографий: ",
            Value: "100",
          },
          resolution: {
            Name: "Разрешение (px): ",
            Value: "1000x1000",
          },
          iso: {
            Name: "ISO: ",
            Value: "в зависимости от сцены",
          },
          colorModel: {
            Name: "Цветовая модель: ",
            Value: "aRGB",
          },
          format: {
            Name: "Формат: ",
            Value: ".png",
          },
          imagePreviewName: [],
          downloadLink: {
            Name: "",
            Value: "",
          }
  };

  constructor() {
    super();
    this.json = JSON.parse(JSON.stringify(AddDS.initialJson));
    this.state = {
        dbJson: this.json,
        photos: [null],
        file: null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cleanState = this.cleanState.bind(this);
    this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
  }

  cleanState() {
    this.sel = document.querySelectorAll(".selectedImg");
    this.sel.forEach((s) => {
      s.style.backgroundImage = "";
      s.classList.remove("selectedImg");
      s.classList.add("selectionImg");
    });
    this.setState({
        dbJson: JSON.stringify(AddDS.initialJson),
        photos: [null],
        file: null
    });
  }

  uploadJSONtoDB() {

  }

  uploadPhotosToServer() {
    for (let i = 0; i < this.state.photos.length; i++) {
        if (this.state.photos[i] != null) {
            this.photo = this.state.photos[i];
            const formData = new FormData();
            formData.append("photo", this.photo, this.state.dbJson.name.Value + "," + this.photo.name);
            fetch("http://127.0.0.1:9999/uploadPhoto", {
               method: "POST",
               body: formData
            });
        }
    }
  }

  uploadFileToServer() {
    this.file = this.state.file;
    if (this.file != null) {
        const formData = new FormData();
        formData.append("upload", this.file, this.state.dbJson.name.Value + "," + this.file.name);
        fetch("http://127.0.0.1:9999/uploadFile", {
               method: "POST",
               body: formData
        });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.uploadPhotosToServer();
    this.uploadFileToServer();
    console.log(this.state);
  }

  // Updating state with new photo (direct to server) and new imagePreviewName element
  // Adding null photo for new image adding
  handleUploadPhoto(event) {
    this.json = this.state.dbJson

    this.url = URL.createObjectURL(event.target.files[0])
    event.target.classList.remove("selectionImg");
    event.target.classList.add("selectedImg");
    event.target.style.backgroundImage =
      "url(" + URL.createObjectURL(event.target.files[0]) + ")";

    this.photos = this.state.photos;
    this.imagePreviewName = this.json.imagePreviewName;
    
    this.photoID = event.target.id;
    if (this.photoID.length < 4) {
        return
    }
    this.photoID = this.photoID.substr(3)
    if (parseInt(this.photoID) < 1 || parseInt(this.photoID) === undefined) {
        return
    }
    if (this.photos.length <= parseInt(this.photoID)) {
        this.photos.push(null);
    }
    this.photos[parseInt(this.photoID) - 1] = event.target.files[0];
    while (this.json.imagePreviewName[parseInt(this.photoID) - 1] === undefined) {
        this.imagePreviewName.push({"Name": "", "Value": ""});
    }
    this.json.imagePreviewName[parseInt(this.photoID) - 1].Name = "photo" + this.photoID
    this.json.imagePreviewName[parseInt(this.photoID) - 1].Value = event.target.files[0].name

    this.setState({
        dbJson: this.json,
        photos: this.photos
    });
  }

  handleUploadFile(event) {
    this.json = this.state.dbJson
    this.json.downloadLink.Name = "file1"
    this.json.downloadLink.Value = event.target.files[0].name
    this.setState({
        dbJson: this.json,
        file: event.target.files[0]
    });
  }

  handleChange(event) {
    this.key = event.target.name.split(",")[0];
    this.propKey = event.target.name.split(",")[1];
    this.value = event.target.value;
    this.json = this.state.dbJson;
    this.element = this.json[this.key];
    this.element[this.propKey] = this.value;
    
    this.setState({
        dbJson: this.json
    });
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
      default:
        return true;
    }
  }

  render() {
    return (
      <div className="view">
        <div className="view-wrapper">
          <form
            onSubmit={this.handleSubmit}
            action=""
            method="post"
            encType="multipart/form-data"
          >
            <input
              type="text"
              name="name,Name"
              placeholder={this.state.dbJson.name.Name}
              onChange={this.handleChange}
            ></input>
            <input
              type="text"
              name="name,Value"
              placeholder={this.state.dbJson.name.Value}
              onChange={this.handleChange}
            ></input>
            <p></p>
            <div className="imagesPreview">
            {Object.entries(this.state.photos).map((key, i) => (
                                    <input
                                    id={"img"+(i+1)}
                                    key={"img"+(i+1)}
                                    type="file"
                                    className="selectionImg"
                                    onChange={this.handleUploadPhoto}
                                  ></input>
                                ))}
            </div>
            <ul>
              <li>
                <input
                  type="text"
                  name="date,Name"
                  value={this.state.dbJson.date.Name}
                  className="bigPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="date,Value"
                  placeholder={this.state.dbJson.date.Value}
                  className="smallPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="time,Name"
                  value={this.state.dbJson.time.Name}
                  className="tinyPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="time,Value"
                  placeholder={this.state.dbJson.time.Value}
                  className="tinyPlaceholder"
                  onChange={this.handleChange}
                ></input>
              </li>
              {Object.entries(this.state.dbJson)
                .filter(([k, _]) => this.readableData(k))
                .map((key) => (
                  <li key={key[0]}>
                    <input
                      type="text"
                      name={key[0] + ",Name"}
                      value={key[1].Name}
                      className="bigPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                    <input
                      type="text"
                      name={key[0] + ",Value"}
                      placeholder={key[1].Value}
                      className="bigPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                  </li>
                ))}
            </ul>
            <p></p>
            <input
              id="file"
              type="file"
              onChange={this.handleUploadFile}
            ></input>
            <p></p>
            <input
              type="submit"
              value="Создать"
              className="buttonPlaceholder"
            ></input>
            <input
              type="reset"
              value="Сбросить"
              className="buttonReset"
              onClick={this.cleanState}
            ></input>
          </form>
        </div>
      </div>
    );
  }
}
