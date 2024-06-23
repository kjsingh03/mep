require('dotenv').config();
const Express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const cors = require('cors');
const { Web3 } = require('web3');
const PoolContractABI = require('./PoolContractABI.json');

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));
const contractAddress = process.env.CONTRACT_ADDRESS;
const poolContract = new web3.eth.Contract(PoolContractABI, contractAddress);

const ownerAddress = process.env.OWNER_ADDRESS;
const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY;

const app = Express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors())
    .use(Express.json());

io.on("connection", (socket) => {
    socket.on("emitBet", (record) => {
        io.emit("updateHistory", record)
    })
})

const resolvePool = async (walletAddress, amount, choice) => {
    try {
        const createRoomData = poolContract.methods.resolvePool(walletAddress, amount * (10 ** 9), choice).encodeABI();
        const gasEstimate = await web3.eth.estimateGas({ from: ownerAddress, to: contractAddress, data: createRoomData });
        const gasPrice = await web3.eth.getGasPrice();

        const tx = {
            from: ownerAddress,
            to: contractAddress,
            gas: gasEstimate,
            gasPrice: gasPrice,
            data: createRoomData,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        const formattedReceipt = JSON.parse(JSON.stringify(receipt, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        return formattedReceipt;
    } catch (error) {
        throw new Error('Error in resolving pool');
    }
};

app.post('/distribute', async (req, res) => {
    try {
        const { walletAddress, betAmount, choice } = req.body;
        if (walletAddress && betAmount && choice) {
            const amountInWei = web3.utils.toWei(betAmount.toString(), 'ether') / 10 ** 27;
            const response = await resolvePool(walletAddress, amountInWei, choice);
            res.status(200).json({ success: true, msg:` ${betAmount} $MEP transferred successfully to ${walletAddress}`, response });
        } else {
            res.status(400).json({ success: false, msg: 'Kindly enter wallet address, bet amount, and choice' });
        }
    } catch (err) {
        console.error('Error in distribute endpoint:', err);
        res.status(500).json({ success: false, msg: 'Transfer request failed', err: err.message });
    }
});

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});