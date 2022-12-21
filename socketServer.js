const SocketServer = (socket) => {
    console.log('Connected');

    socket.on('msg_from_client', function(from,msg){
        console.log('Message is '+from, msg);
    })
    socket.on('disconnect', function(msg){
        console.log('Disconnected');
    })
}

module.exports = SocketServer