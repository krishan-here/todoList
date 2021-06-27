const express = require("express");
const bodyParser = require("body-parser");
const { static } = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // for using ejs

app.use(express.static("public"));

//use mongodb

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

let item1 = new Item({
  name: "type a note here",
});

let item2 = new Item({
  name: "click + to save item",
});

let item3 = new Item({
  name: "<-- check box for delete item",
});

let defaultItems = [item1, item2, item3];

// make model for costum list

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  Item.find((err, foundItems) => {
    if (err) {
      console.log(err);
    } else if (foundItems.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added default items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { event: "Today", newItem: foundItems });
    }
  });
});

app.post("/", (req, res) => {
  // let listName = req.body.list;
  let itemName = req.body.newItem;

  const item = new Item({
    name: itemName,
  });
  // List.findOne({ name: listName }, (err, foundItem) => {
  //   if (!err) {
  //     if (!foundItem) {
  //       console.log("something error!!");
  //     } else {
  //       foundItem.items.insert(item);
  //       res.redirect("/" + listName);
  //     }
  //   }
  // });
  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;

  Item.findByIdAndDelete(itemId, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("sucessfully deleted");
      res.redirect("/");
    }
  });
});

//creating dynamic list using express params

app.get("/:costumListName", (req, res) => {
  const costumListName = req.params.costumListName;

  List.findOne({ name: costumListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: costumListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + costumListName);
      } else {
        //show the existing list
        res.render("list", { event: foundList.name, newItem: foundList.items });
      }
    }
  });
});

app.listen(3000, () => {
  console.log("running in port 3000");
});
