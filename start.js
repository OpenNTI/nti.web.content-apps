const { spawn } = require("child_process");

const fs = require("fs-extra");
const { Parcel } = require("@parcel/core");

async function start() {
	//clean up last run
	await fs.remove("./dist");

	//copy electron backend
	await fs.ensureDir("./dist/backend");
	await fs.copy("./app/backend", "./dist/backend");

	//setup bundler
	const bundler = new Parcel({
		entries: "./app/frontend/index.html",
		defaultConfig: "@parcel/config-default",
		targets: {
			default: {
				context: "browser",
				publicUrl: "./",
				distDir: "./dist/frontend",
				engines: {
					electron: "^16.0.2",
				},
			},
		},
	});

	let electron = null;

	const subscriber = await bundler.watch((err, event) => {
		if (err) {
			//fatality
			throw err;
		}

		if (event.type === "buildSuccess") {
			let bundles = event.bundleGraph.getBundles();
			console.log(
				`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`
			);
		} else if (event.type === "buildFailure") {
			console.log(event.diagnostics);
		}

		if (!electron) {
			electron = spawn("npm", ["run", "start-electron"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true,
			});

			electron.on("close", async () => {
				await subscriber.unsubscribe();
				console.log("Shutting Down");
				process.exit();
			});
		}
	});
}

start();
