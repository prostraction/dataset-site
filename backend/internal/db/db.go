package db

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	opts       *options.ClientOptions
	con        *mongo.Client
	uri        string
	name       string
	collection string

	cacheList []ListOfSets
	cacheSet  map[string]Set
}

func (db *Database) InitDatabase(uri string, name string, collection string) (err error) {
	db.uri = uri
	db.name = name
	db.collection = collection

	db.InitCache()

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	db.opts = options.Client().ApplyURI(db.uri).SetServerAPIOptions(serverAPI)
	db.con, err = mongo.Connect(context.Background(), db.opts)

	if err != nil {
		return err
	}
	defer db.Disconnect()

	// Send a ping to confirm a successful connection
	var result bson.M
	if err := db.con.Database(db.name).RunCommand(context.TODO(), bson.D{{Key: "ping", Value: 1}}).Decode(&result); err != nil {
		return err
	}

	return nil
}

func (db *Database) Connect() (err error) {
	db.con, err = mongo.Connect(context.Background(), db.opts)
	return err
}

func (db *Database) Disconnect() (err error) {
	return db.con.Disconnect(context.Background())
}

func (db *Database) LoadSet(name string) (Set, error) {
	if val, ok := db.GetCachedSet(name); ok {
		return val, nil
	}

	if err := db.Connect(); err != nil {
		return Set{}, err
	}
	defer db.Disconnect()

	var result Set
	collection := db.con.Database(db.name).Collection(db.collection)
	filter := bson.D{{Key: "name.name", Value: name}}
	err := collection.FindOne(context.Background(), filter).Decode(&result)
	if err != nil {
		fmt.Println("Loading ", name, " error: ", err)
		return Set{}, err
	}

	db.cacheSet[name] = result
	return result, nil
}

func (db *Database) LoadList() ([]ListOfSets, error) {
	if db.cacheList != nil {
		return db.cacheList, nil
	}

	if err := db.Connect(); err != nil {
		return []ListOfSets{}, err
	}

	defer db.Disconnect()

	var result []ListOfSets
	collection := db.con.Database(db.name).Collection(db.collection)
	cursor, err := collection.Find(context.Background(), bson.D{})
	if err != nil {
		return []ListOfSets{}, err
	}
	for cursor.Next(context.Background()) {
		var list ListOfSets
		if err := cursor.Decode(&list); err != nil {
			return []ListOfSets{}, err
		}
		result = append(result, list)
	}
	if err := cursor.Err(); err != nil {
		return []ListOfSets{}, err
	}

	db.cacheList = result

	return result, err
}

func (db *Database) PushSet(set Set) error {
	if _, ok := db.GetCachedSet(set.Name.Name); ok {
		return errors.New("dataset already exists")
	}

	if err := db.Connect(); err != nil {
		return err
	}
	defer db.Disconnect()

	collection := db.con.Database(db.name).Collection(db.collection)
	_, err := collection.InsertOne(context.Background(), set)
	db.LoadSetListCache()
	return err
}

func (db *Database) DeleteSet(name string) error {
	if err := db.Connect(); err != nil {
		return err
	}
	defer db.Disconnect()

	collection := db.con.Database(db.name).Collection(db.collection)
	filter := bson.D{{Key: "name.name", Value: name}}
	opts := options.Delete().SetHint(bson.D{{Key: "_id", Value: 1}})
	result, err := collection.DeleteMany(context.Background(), filter, opts)
	if err != nil {
		return err
	}
	fmt.Println("Removed: ", result.DeletedCount)
	db.LoadSetListCache()
	if db.cacheSet != nil {
		delete(db.cacheSet, name)
	}
	return nil
}

func (db *Database) InitCache() {
	db.cacheSet = make(map[string]Set)
}

func (db *Database) LoadSetListCache() {
	if db.cacheList != nil {
		db.cacheList = nil
	}
	db.LoadList()
}

func (db *Database) GetCachedSet(name string) (val Set, ok bool) {
	if db.cacheSet == nil {
		db.InitCache()
	}
	val, ok = db.cacheSet[name]
	return val, ok
}

func (db *Database) ClearAllCache() {
	db.cacheList = nil
	db.cacheSet = nil
}
