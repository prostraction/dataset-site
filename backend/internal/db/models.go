package db

type ListOfSets struct {
	Name Detail `json:"name"`
}

type Set struct {
	Name              Detail `json:"name"`
	Date              Detail `json:"date"`
	Time              Detail `json:"time"`
	Count             Detail `json:"count"`
	Resolution        Detail `json:"resolution"`
	Iso               Detail `json:"iso"`
	ColorModel        Detail `json:"colorModel"`
	Format            Detail `json:"format"`
	ImagePreviewName1 Detail `json:"imagePreviewName1"`
	ImagePreviewName2 Detail `json:"imagePreviewName2"`
	ImagePreviewName3 Detail `json:"imagePreviewName3"`
	DownloadLink      Detail `json:"downloadLink"`
}

type Detail struct {
	Name  string      `json:"Name"`
	Value interface{} `json:"Value"`
}
