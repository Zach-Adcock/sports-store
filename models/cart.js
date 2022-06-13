module.exports = function Cart(existingCart) {
    this.items = (Object.keys(existingCart).length === 0) ? {} : existingCart.items
    this.itemCount = existingCart.itemCount || 0;
    this.totalPrice = existingCart.totalPrice || 0;

    this.add = function(item, id) {
        let storedItem = this.items[id]
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.itemCount++;
        this.totalPrice += storedItem.item.price;
    }

    this.createArray = function() {
        const arr = [];
        for (const id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    }
}