//TODO: command array: make the commands parser go throw some kind of array of command-names with functions to call for each command
//TODO: add command \whois which returns name <-> IP
//TODO: add command \who to show who is in the chat
var net = require('net');

var sockets = [];

var s = net.Server(function (socket) {
    sockets.push({socket:socket, name:socket.remoteAddress});
    socket.write('Epic Chat Server\n\rFor help type \\help\n\rJust type to chat!\n\r'); 
    var addr = socket.remoteAddress;
    console.log('new connection from: ' + addr);
    writeToAll(addr + ' connected!\n\r');

    // sends a message to all sockets except the current socket
    function writeToAll(msg) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].socket == socket) continue; // skip myself
            sockets[i].socket.write(msg);
        }
    }

    // looks for an existing named socket in sockets[]
    // returns the index in sockets[] or -1 if not found
    // TODO: update this to return a name instead of an index (there are no possible cases when a name cannot be in the list)
    function findExistingName(socket) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i].socket == socket) {
                return i;
            }
        };
        return -1;
    }

    socket.on('data', function(d) {
        //append newline if missing
        d = (/\n.?$/.test(d)) ? d : d + '\n';
        var consoleStr = d;
        console.log('received message from ' + socket.remoteAddress + ': '
            + new String(d).replace(/\n$/, ''));

        // parse input for valid commands
        if (!parseForCommands(d)) {
            // if it wasn't a command then write it to everybody
            writeToAll(sockets[findExistingName(socket)].name + ': ' + d);
        }
    });

    function parseForCommands(msg) {
        // \help command to show help
        if (/\help/.test(msg)) {
            socket.write(
                '\\nick\t\tshows your nickname\n\r' +
                '\\nick name\tchanges your nickname to name\n\r' +
                '\\help\t\tshows this message\n\r' +
                '\\exit\t\tquits the chat\n\r'
            );
            return true;
        }

        // \nick command to change nickname
        if (/\\check/.test(msg)) {
            return true;
        }

        // \nick command to change nickname
        if (/\\nick/.test(msg)) {
            var i;
            if (/\\nick [a-zA-Z][a-zA-Z][a-zA-Z0-9]*/.test(msg)) {
                var name = /[^ ]*$/.exec(msg);
                name = /^[a-zA-Z0-9]*/.exec(name);
                console.log('setting \'' + name + '\' as name for ' + addr);

                writeToAll(sockets[findExistingName(socket)].name + ' changed name to ' + name + '\n\r');
                sockets[findExistingName(socket)].name = name;

            } else {
                // with no parameter, echo current name
                i = findExistingName(socket);
                if (i < 0) {
                    socket.write('you have no name!\n\r');
                } else {
                    socket.write('your name is: ' + sockets[i].name + '\n\r');
                }
            }
            return true;
        }

        // \exit command to quit
        if (/\\exit/.test(msg)) {
            socket.end('goodbye\n\r');
            return true;
        }

        return false;
    }

    socket.on('end', function() {
        var i = sockets.indexOf(socket);
        sockets.splice(i, 1);
        writeToAll(addr + ' disconnected!\n\r');
        console.log('client disconnected');
    });

});

s.listen(1337);

console.log('Starting epic chat server on port 1337');
