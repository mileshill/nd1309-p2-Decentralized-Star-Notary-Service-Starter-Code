const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

class Star {
    constructor(name, symbol, tokenId) {
        this.name = name;
        this.symbol = symbol;
        this.tokenId = tokenId;
    }
}

it('can Create a Star', async () => {
    const star = new Star("Awesome Star", "AWS", 1)
    let instance = await StarNotary.deployed();
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: accounts[0]})
    let result = await instance.tokenIdToStarInfo.call(star.tokenId)
    //assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
    assert.equal(result.name, star.name)
});


it('lets user1 put up their star for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starPrice = web3.utils.toWei(".01", "ether");
    const star = new Star("Awesome Star", "AWE", 2)
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: user1});
    await instance.putStarUpForSale(star.tokenId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(star.tokenId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    // Connect to contract
    let instance = await StarNotary.deployed();
    // Get the accounts
    let user1 = accounts[1];
    let user2 = accounts[2];
    // Monetary values
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    // Creating the star
    const star = new Star("Awesome Star", "AWE", 3)
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: user1});

    // Sell the star
    await instance.putStarUpForSale(star.tokenId, starPrice, {from: user1});

    // Validating the transaction: before
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(star.tokenId, {from: user2, value: balance});

    // Validating the transaction: after
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);

    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const star = new Star("Awesome Star", "AWE", 4)
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar(star.name, star.symbol, star.tokenId, {from: user1});
    await instance.putStarUpForSale(star.tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(star.tokenId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(star.tokenId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    const star = new Star("Awesome Star", "AWE", 5)
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar(star.name, star.symbol, star.tokenId, {from: user1});
    await instance.putStarUpForSale(star.tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(star.tokenId, {from: user2, value: balance, gasPrice: 0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests
it('can add the star name and star symbol properly', async () => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    const star = new Star("Awesome Star", "AWE", 6)
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: user1});
    let results = await instance.lookUptokenIdToStarInfo(star.tokenId)
    assert.equal(star.name, results.name)
    assert.equal(star.symbol, results.symbol)

});

it('lets 2 users exchange stars', async () => {
    let instance = await StarNotary.deployed();
    let address1 = accounts[1]
    let address2 = accounts[2]

    // 1. create 2 Stars with different tokenId
    const star1 = new Star("One", "One", 101)
    const star2 = new Star("Two", "Two", 102)
    await instance.createStar(star1.name, star1.symbol, star1.tokenId, {from: address1})
    await instance.createStar(star2.name, star2.symbol, star2.tokenId, {from: address2})

    assert.equal(await instance.ownerOf(star1.tokenId), address1)
    assert.equal(await instance.ownerOf(star2.tokenId), address2)
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(star1.tokenId, star2.tokenId, {from: address1})

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(star1.tokenId), address2)
    assert.equal(await instance.ownerOf.call(star2.tokenId), address1)
});

it('lets a user transfer a star', async () => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    const star = new Star("Transfer", "Tran", 103)
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: accounts[1]})
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[2], star.tokenId, {from: accounts[1]})
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(star.tokenId) == accounts[2], true)
});

it('lookUptokenIdToStarInfo test', async () => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    const star = new Star("Awesome", "AWE", 9)
    await instance.createStar(star.name, star.symbol, star.tokenId, {from: accounts[0]})
    let results = await instance.lookUptokenIdToStarInfo(star.tokenId)
    assert.equal(results.name, star.name)
});