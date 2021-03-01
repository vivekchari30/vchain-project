

const Websocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev



class P2pServer {
    constructor(blockchain) {
        this.blockchain= blockchain;
        this.socket = [];
    }
    
    listen() {
        const server = new Websocket.Server({port: P2P_PORT});
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();
        console.log(`listening for peer-to-peer connection on: ${P2P_PORT}`);
    }

    connectToPeers(){
        peers.forEach(peer => {
     
            const socket = new Websocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.socket.push(socket);
        console.log('socket connected');

        this.messageHandler(socket);
        this.sendChain(socket);
    }
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);

            this.blockchain.replaceChain(data);
        });
    }
 
    sendChain(socket){
        socket.send(JSON.stringify(this.blockchain.chain));

    }
    syncChains() {
        this.socket.forEach( socket => this.sendChain(socket));
    }
}

module.exports = P2pServer;