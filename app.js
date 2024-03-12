//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Akshat:Akshatsinha2000@blog.9dxmvzk.mongodb.net/todolist?retryWrites=true&w=majority&appName=Blog");

const itemSchema = new mongoose.Schema({
  name: String,
  createdDate:{
    type:Date,
    default:Date.now
  }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Walk",
  
});
const item2 = new Item({
  name: "Cleaning",
  
});
const item3 = new Item({
  name: "Make food",
  
});

const defaultitem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  item: [itemSchema]
});

const List = mongoose.model("list", listSchema);




app.get("/", function (req, res) {

  Item.find({}).then(function (itemFound) {

    if (itemFound.length === 0) {
      Item.insertMany(defaultitem).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      console.log(itemFound)
      res.render("list", { listTitle: "Today", newListItems: itemFound });
    }
  });

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
      List.findOne({ name: listName }).then(function (foundlist) {
        foundlist.item.push(item);
        foundlist.save();
        res.redirect("/" + listName);
    })
      .catch(function (err) {
        console.log(err)
      })
  }
});

app.post("/delete", function (req, res) {

  const deleteitemId = req.body.checkbox;
  const listName = req.body.listName;

  console.log(deleteitemId);

  if(listName === "Today"){
    Item.findByIdAndRemove(deleteitemId).then(() => {
      console.log(deleteitemId);
      res.redirect("/");
    })
      .catch((err) => { console.log(err); })
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{item:{_id:deleteitemId}}}).then(function(foundlist){
        res.redirect("/"+listName)
      })
    }
  });

  

app.get("/:customlist", function (req, res) {
  const customListName = _.capitalize(req.params.customlist);

  List.findOne({ name: customListName }).then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        item: defaultitem
      })
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.item })
    }

  });


})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
