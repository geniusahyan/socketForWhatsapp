import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

let persons = [];

const addPerson = (personData, socketId) => {
    !persons.some(person => person.sub === personData.sub) && persons.push(
        { ...personData, socketId }
    );
};

const getPerson = (personId) => {
    return persons.find(person => person.sub === personId);
};

io.on('connection', (socket) => {
    console.log("connected to server");

    socket.on('addPerson', (personData) => {
        addPerson(personData, socket.id); // Pass socket.id as the second parameter
        io.emit("getPerson", persons);
    });

    socket.on('sendMessage', (data) => {
        const person = getPerson(data.receiverId);

        if (person) {
            io.to(person.socketId).emit('getMessage', data);
        } else {
            console.error(`Person not found for receiverId: ${data.receiverId}`);
        }
    });
});

httpServer.listen(3001, () => {
    console.log('Socket.IO server is running on http://localhost:3001');
});
