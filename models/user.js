const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items:[]}
    this._id = id;
  }

  save() {
    const db = getDb();
    db.collection("users")
      .insertOne(this)
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }
  addToCart(product) {
    console.log(product);

    let cartProductIndex = -1;
    if (this.cart.items !== undefined) {
      cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
      });
    }
    let newQuantity = 1;
    let updatedCartItems = [];
    if (this.cart.items !== undefined) {
      updatedCartItems = [...this.cart.items];
    }
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $set: { cart: updatedCart },
      }
    );
  }

  getCart() {
    const db = getDb();
    let productIds = [];
    if (this.cart.items !== undefined) {
      productIds = this.cart.items.map((i) => {
        return i.productId;
      });
    }

    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find((i) => {
              return i.productId.toString() === p._id.toString();
            }).quantity,
          };
        });
      })
      .catch((err) => console.log(err));
  }

  deleteCartItem(prodId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== prodId.toString();
    });
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $set: { cart: { items: updatedCartItems } },
      }
    );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }
  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new ObjectId(this._id) })
      .toArray();
  }
  static findUserById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(userId) })
      .then((user) => {
        console.log(user);
        return user;
      })
      .catch((err) => console.log(err));
  }
}
module.exports = User;
