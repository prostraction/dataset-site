import * as React from "react";
import InputDS from "./inputDS";

export default class AddDS extends React.Component {
  constructor(props) {
    super(props);
    this.json = JSON.parse(JSON.stringify(AddDS.initialJson));
    this.state = {
      dbJson: this.json,
      photos: ["images/_/add.svg"],
      file: null,
      formKey: Date.now(),
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static initialJson = {
    name: {
      Name: "Dataset name",
      Value: "Название датасета",
    },
    category: {
      Name: "Категория",
      Value: "none",
    },
    description: {
      Name: "Description",
      Value: "",
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
    },
  };

  handleSubmit(event) {
    event.preventDefault();
    this.uploadJSONtoServer();
  }

  cleanState() {
    this.sel = document.querySelectorAll(".selectedImg");
    this.sel.forEach((s) => {
      s.style.backgroundImage = "";
      s.classList.remove("selectedImg");
      s.classList.add("selectionImg");
    });

    this.setState(
      {
        dbJson: JSON.parse(JSON.stringify(AddDS.initialJson)),
        photos: ["images/_/add.svg"],
        file: null,
        formKey: Date.now(),
      },
      () => {
        // log the new state to the console
        console.log(this.state);
      }
    );
  }

  uploadJSONtoServer() {
    const formData = new FormData();
    if (this.state.dbJson != null) {

      /* Images */
      for (let i = 0; i < this.state.photos.length - 1; i++) {
        if (this.state.photos[i] != null) {
          this.photo = this.state.photos[i];
          formData.append("photo", this.photo);
        }
      }

      /* File */
      this.file = this.state.file;
      if (this.file != null) {
        formData.append("upload", this.file);
      }

      formData.append("jsonDB", JSON.stringify(this.state.dbJson))
      console.log(formData);
        
      fetch("http://127.0.0.1:9999/postJSON/", {
        method: "POST",
        body: formData,
        headers: new Headers({
          "Accept": "*",  // application/json
          "type": "formData"
        }),
      })
      .then(() => {
        this.cleanState();
      }).catch((error) => {
        alert(error);
      });
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className="view">
        <InputDS edit={this.state} cleanState={this.cleanState}></InputDS>
        <form
          onSubmit={this.handleSubmit}
          action=""
          method="post"
          encType="multipart/form-data"
        >
          <input
            type="submit"
            value="Создать"
            className="buttonPlaceholder"
            onClick={this.handleSubmit}
          ></input>
          <input
            type="reset"
            value="Сбросить"
            className="buttonReset"
            onClick={() => {
              this.setState({
                dbJson: JSON.parse(JSON.stringify(AddDS.initialJson)),
                photos: [null],
                file: null,
                formKey: Date.now(),
              });
              this.cleanState();
            }}
          ></input>
        </form>
      </div>
    );
  }
}
