const users = [];
const SocketServer = async (socket) => {
    console.log('Connected');
    socket.on('join_auction_product', (userId, productId) => {
        const indexUserUnit = users.findIndex(userFind => userFind.id === userId && userFind.productId === productId);
        if (indexUserUnit === -1 && userId && productId) {
            users.push({ id: userId, productId: productId, socketId: socket.id });
        }
        console.log('users', users)
    });

    socket.on('add_message_group', (msg, productId) => {
        const userList = users.filter(userFind => userFind.productId === productId);
        userList.forEach(userFindByProduct => {
            console.log('productId:', userFindByProduct.productId)
            console.log('userId:', userFindByProduct.productId)
            socket.to(`${userFindByProduct.socketId}`).emit('add_message_to_client', msg);
        });
    });

    // socket.on('msg_from_client', function(from,msg){
    //     console.log('Message is '+from, msg);
    //     console.log('socket id: ', socket.id);
    // })
    socket.on('disconnect', function(msg) {
        console.log('Disconnected');
    });

};

module.exports = SocketServer;