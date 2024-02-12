# messenger-push
Push Notifications Server for Messenger

## Notes
* the entry point is `bin/peerjs.ts`
* the `PeerServer` component can be found at `src/index.ts`
* `PeerServer` also uses `express` and `ExpressPeerServer`, so look at it instead
* `The PeerServer` has a callback, which is used in the `bin/peerjs.ts`. It is used to read the host and port information.
* The `createInstance` component is from `src/instance.ts`
  
## ExpressPeerServer
```
function ExpressPeerServer(
	server: https.Server | http.Server,
	options?: Partial<IConfig>,
) {
	const app = express();

	const newOptions: IConfig = {
		...defaultConfig,
		...options,
	};

	if (newOptions.proxied) {
		app.set(
			"trust proxy",
			newOptions.proxied === "false" ? false : !!newOptions.proxied,
		);
	}

	app.on("mount", () => {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (!server) {
			throw new Error(
				"Server is not passed to constructor - " + "can't start PeerServer",
			);
		}

		createInstance({ app, server, options: newOptions });
	});

	return app as Express & PeerServerEvents;
}
```

## Needed packages for the peerjs-server
We will be building our application behind a reverse proxy with nginx, so we don't have to deal with ssl etc.
* express
* http from http
* https from https