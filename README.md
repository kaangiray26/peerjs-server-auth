# peerjs-server-auth
Server for PeerJS with Authentication

This project is forked from [peers/peerjs-server](https://github.com/peers/peerjs-server) to offer a proof of concept for authenticated peers. Normally, peers are given random IDs by the PeerJS server unless the peer explicitely specifies an ID. However, these IDs are only meant for establishing a connection since everyone can use any ID. This project gives peers the opportunity to reserve an ID with a token and use it for authentication.

## Usage
The usage is pretty straightforward for the client. Just create a new Peer as follows with the details of your server, id and token:
```
import { Peer } from 'peerjs';

// Specify your uuid and token
const id = 'a7ec07d5-d919-49b2-ba95-f206961aadaf';
const token = 'my-super-secret-token';

const peer = new Peer([id], {
	host: 'home.buzl.uk',
	port: 443,
	path: '/',
	token: token,
	secure: true
});
```

If you use a ID-token pair that is not in the database, the server will register it as a new login. If you use a ID-token pair that is already in the database, the server will check if the token is correct. If it is, the peer is authenticated and can establish a connection. If it is not, the peer will be disconnected. Very simple.

## Running the server
If you want to run your own server, you can use the `docker-compose.yml` file, which will start a HTTP server and a WS server along with a PostgreSQL database. Just run `docker-compose up` and your server will be available at `http://localhost:3000`.

If you want to run this service behind a reverse proxy, you can add the following under the `server` section of your nginx configuration:
```
location /peerjs {
	proxy_pass http://localhost:3000;
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "Upgrade";
	proxy_set_header Host $host;
}
```

You can get the latest `docker-compose.yml` file from the [releases](https://github.com/kaangiray26/peerjs-server-auth/releases) page.