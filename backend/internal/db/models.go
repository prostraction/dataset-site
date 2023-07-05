package db

type ListOfSets struct {
	Name Detail `json:"name"`
}

type Set struct {
	Name       Detail `json:"name"`
	Date       Detail `json:"date"`
	Time       Detail `json:"time"`
	Count      Detail `json:"count"`
	Resolution Detail `json:"resolution"`
	Iso        Detail `json:"iso"`
	ColorModel Detail `json:"colorModel"`
	Format     Detail `json:"format"`
}

type Detail struct {
	Name  string      `json:"Name"`
	Value interface{} `json:"Value"`
}
