package db

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	con        *mongo.Client
	uri        string
	name       string
	collection string
	opts       *options.ClientOptions
}

func (db *Database) InitDatabase(uri string, name string, collection string) error {
	db.uri = uri
	db.name = name
	db.collection = collection

	var err error

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	db.opts = options.Client().ApplyURI(db.uri).SetServerAPIOptions(serverAPI)
	db.con, err = mongo.Connect(context.Background(), db.opts)

	if err != nil {
		return err
	}

	// Send a ping to confirm a successful connection
	var result bson.M
	if err := db.con.Database(db.name).RunCommand(context.TODO(), bson.D{{Key: "ping", Value: 1}}).Decode(&result); err != nil {
		return err
	}

	return db.Disconnect()
}

func (db *Database) Connect() (err error) {
	db.con, err = mongo.Connect(context.Background(), db.opts)
	if err != nil {
		return
	}
	return nil
}

func (db *Database) Disconnect() (err error) {
	return db.con.Disconnect(context.Background())
}

func (db *Database) LoadSet(name string) (Set, error) {
	if err := db.Connect(); err != nil {
		return Set{}, err // some err handling
	}

	test := db.con.Database(db.name).Collection(db.collection)

	var result Set
	filter := bson.D{{Key: "name.Name", Value: name}} // This is an empty filter which will match all documents in the collection.
	err := test.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Printf("Fetched document: %+v\n", result)

	db.Disconnect()
	return result, nil
	//fmt.Println(test.CountDocuments(context.Background(), bson.D{}, nil))
}
