const path = require("path");

const { app, BrowserWindow, ipcMain, dialog, protocol } = require("electron");

const customProtocols = require("./protocol");

try {
	require("electron-reloader")(module);
} catch {
	//swallow
}

let mainWindow = null;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 728,
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
		},
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	mainWindow.loadFile(path.join(__dirname, "../frontend/index.html"));
};

app.on("window-all-closed", () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== "darwin") {
		app.quit();
	}
});

protocol.registerSchemesAsPrivileged([
	{ scheme: "nti", privileges: { stream: true } },
]);

app.whenReady()
	.then(() => {
		protocol.registerStreamProtocol("nti", async (request, callback) => {
			const url = new URL(request.url);
			const handler = customProtocols.streams[url.host]?.[request.method];

			if (!handler) {
				//-6 is FILE_NOT_FOUND
				callback({ error: -6 });
			}

			const resp = await handler(url, request);

			callback(resp);
		});

		createWindow();

		app.on("activate", () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow();
		});
	})
	.catch(console.log);

ipcMain.handle("filesystem:select", async (event) => {
	const selection = await dialog.showOpenDialog({
		properties: ["openFile"],
	});

	return selection;
});
