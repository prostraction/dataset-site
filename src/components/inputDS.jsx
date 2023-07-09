import * as React from "react";

export default class InputDS extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        //this.cleanState = this.cleanState.bind(this);
    }

  // Updating state with new photo (direct to server) and new imagePreviewName element
  // Adding null photo for new image adding
  handleUploadPhoto(event) {
    const {edit} = this.props;
    this.json = edit.dbJson;

    this.url = URL.createObjectURL(event.target.files[0]);
    event.target.classList.remove("selectionImg");
    event.target.classList.add("selectedImg");
    event.target.style.backgroundImage =
      "url(" + URL.createObjectURL(event.target.files[0]) + ")";

    this.photos = this.props.edit.photos;
    this.imagePreviewName = this.json.imagePreviewName;

    this.photoID = event.target.id;
    if (this.photoID.length < 4) {
      return;
    }
    this.photoID = this.photoID.substr(3);
    if (parseInt(this.photoID) < 1 || parseInt(this.photoID) === undefined) {
      return;
    }
    if (this.photos.length <= parseInt(this.photoID)) {
      this.photos.push(null);
    }
    this.photos[parseInt(this.photoID) - 1] = event.target.files[0];
    while (
      this.json.imagePreviewName[parseInt(this.photoID) - 1] === undefined
    ) {
      this.imagePreviewName.push({ Name: "", Value: "" });
    }
    this.json.imagePreviewName[parseInt(this.photoID) - 1].Name =
      "photo" + this.photoID;
    this.json.imagePreviewName[parseInt(this.photoID) - 1].Value =
      event.target.files[0].name;

    edit.dbJson = this.json;
    edit.photos = this.photos;
    console.log(this.props.edit)
    this.forceUpdate();
    //this.setState({
    //  dbJson: this.json,
    //  photos: this.photos,
    //});
  }

  handleUploadFile(event) {
    const {edit} = this.props;
    this.json = edit.dbJson;
    this.json.downloadLink.Name = "file1";
    this.json.downloadLink.Value = event.target.files[0].name;
    edit.dbJson = this.json;
    edit.file = event.target.files[0];
    //this.forceUpdate();
    //this.setState({
    //  dbJson: this.json,
    //  file: event.target.files[0],
    //});
  }

  handleChange(event) {
    const {edit} = this.props;
    this.key = event.target.name.split(",")[0];
    this.propKey = event.target.name.split(",")[1];
    this.value = event.target.value;
    this.json = edit.dbJson;
    this.element = this.json[this.key];
    this.element[this.propKey] = this.value;
    edit.dbJson = this.json;
    //this.setState({
    //  dbJson: this.json,
    //});
    //console.log(this.state.dbJson)
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
        const {edit} = this.props;
        console.log(this.props)
        console.log("props: ", edit)
        return (
            <div className="view">
            <div className="view-wrapper">
              <form
                onSubmit={this.handleSubmit}
                key={edit.formKey}
                action=""
                method="post"
                encType="multipart/form-data"
              >
                <input
                  type="text"
                  name="name,Value"
                  placeholder={edit.dbJson.name.Value}
                  onChange={this.handleChange}
                ></input>
                <input
                  type="text"
                  name="name,Name"
                  placeholder={edit.dbJson.name.Name}
                  onChange={this.handleChange}
                ></input>
                <p></p>
                <div className="imagesPreview">
                  {Object.entries(edit.photos).map((key, i) => (
                    <input
                      id={"img" + (i + 1)}
                      key={"img" + (i + 1)}
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
                      defaultValue={edit.dbJson.date.Name}
                      className="bigPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                    <br className="hidingAdditionalInput"></br>
                    <input
                      type="text"
                      name="date,Value"
                      placeholder={edit.dbJson.date.Value}
                      className="smallPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                    <br className="hidingAdditionalInput"></br>
                    <input
                      type="text"
                      name="time,Name"
                      defaultValue={edit.dbJson.time.Name}
                      className="tinyPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                    <br className="hidingAdditionalInput"></br>
                    <input
                      type="text"
                      name="time,Value"
                      placeholder={edit.dbJson.time.Value}
                      className="tinyPlaceholder"
                      onChange={this.handleChange}
                    ></input>
                  </li>
                  {Object.entries(edit.dbJson)
                    .filter(([k, _]) => this.readableData(k))
                    .map((key) => (
                      <li key={key[0]}>
                        <input
                          type="text"
                          name={key[0] + ",Name"}
                          defaultValue={key[1].Name}
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
              </form>
            </div>
            </div>
        );
      }
}