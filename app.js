//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = {
  name : String
};

const Item =  mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to Todo list app."
});
const item2 = new Item({
  name: " Press + to add new tasks."
});
const item3 = new Item({
  name: "<-- hit this to delete an item."
});
const defaultItems = [item1,item2,item3];
 const listSchema = {
  name:String,
  items:[itemSchema]
 };

 const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find(function(err, items){
    if(items.length == 0){
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("default item added");
        }
      res.redirect("/");
      });
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name:itemName
  });
  if(listName=== "Today"){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},function(err, foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName)
    })
  }
  
});

app.post("/delete", function(req,res){
  const listName=req.body.listName;
  const itemId =  req.body.checkbox;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemId,function(err){
      if(!err){
        console.log("item removed succesfully");
      }
    });
    res.redirect("/");
  } else {
     List.findOneAndUpdate({name:listName},{$pull: {items: {_id:itemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+ listName);  
        }
     });
  }
  
});

app.get("/:listName", function(req,res){
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name:customListName},function(err,result){
    if(!err){
      if(!result){
        //create new list;
        const list = new List({
          name:customListName,
          items:defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
  }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
