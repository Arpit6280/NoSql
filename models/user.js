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
    // const cartProduct = this.cart.items.findIndex((cp) => {
    //   return cp._id === product._id;
    // });
    // product.quantity
    const updatedCart = {
      items: [{ productId: new ObjectId(product._id), quantity: 1 }],
    };
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new ObjectId(this._id) },
      {
        $set: { cart: updatedCart },
      }
    );
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
