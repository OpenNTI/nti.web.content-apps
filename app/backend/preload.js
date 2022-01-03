const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("localFileSystem", {
	select: () => ipcRenderer.invoke("filesystem:select"),
});
