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
  };

  constructor() {
    super();
    this.state = JSON.parse(JSON.stringify(AddDS.initialJson));
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
    this.setState(JSON.parse(JSON.stringify(AddDS.initialJson)));
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  handleUploadPhoto(event) {
    console.log(event.target);
    console.log(event.target.files[0].name);
    console.log(typeof event.target);
    console.log(URL.createObjectURL(event.target.files[0]));
    event.target.classList.remove("selectionImg");
    event.target.classList.add("selectedImg");
    event.target.style.backgroundImage =
      "url(" + URL.createObjectURL(event.target.files[0]) + ")";
  }

  handleUploadFile(event) {}

  handleChange(event) {
    this.key = event.target.name.split(",")[0];
    this.propKey = event.target.name.split(",")[1];
    this.value = event.target.value;
    this.element = this.state[this.key];
    this.element[this.propKey] = this.value;

    this.setState({
      [this.key]: this.element,
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
      case "imagePreviewName1":
        return false;
      case "imagePreviewName2":
        return false;
      case "imagePreviewName3":
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
              placeholder={this.state.name.Name}
              onChange={this.handleChange}
            ></input>
            <input
              type="text"
              name="name,Value"
              placeholder={this.state.name.Value}
              onChange={this.handleChange}
            ></input>
            <p></p>
            <div className="imagesPreview">
              <input
                id="img1"
                type="file"
                className="selectionImg"
                onChange={this.handleUploadPhoto}
              ></input>
              <input
                id="img2"
                type="file"
                className="selectionImg"
                onChange={this.handleUploadPhoto}
              ></input>
              <input
                id="img3"
                type="file"
                className="selectionImg"
                onChange={this.handleUploadPhoto}
              ></input>
            </div>
            <ul>
              <li>
                <input
                  type="text"
                  name="date,Name"
                  value={this.state.date.Name}
                  className="bigPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="date,Value"
                  placeholder={this.state.date.Value}
                  className="smallPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="time,Name"
                  value={this.state.time.Name}
                  className="tinyPlaceholder"
                  onChange={this.handleChange}
                ></input>
                <br className="hidingAdditionalInput"></br>
                <input
                  type="text"
                  name="time,Value"
                  placeholder={this.state.time.Value}
                  className="tinyPlaceholder"
                  onChange={this.handleChange}
                ></input>
              </li>
              {Object.entries(this.state)
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
              onChange={this.handleUploaFile}
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
