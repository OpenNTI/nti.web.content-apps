const fs = require("fs");
const mime = require("mime-types");

module.exports.streams = {
	"local-file": {
		GET: (url, req) => {
			const path = url.searchParams.get("path");

			const stats = fs.statSync(path);

			const range = req.headers?.Range ?? req.headers?.range;
			const resp = {
				headers: {
					"Content-Type": mime.lookup(path),
				},
			};

			if (range) {
				const chunkSize = 10 ** 6;

				const [startRaw, endRaw] = range
					.replace(/bytes=/, "")
					.split("-");
				const start = parseInt(startRaw, 10);
				const end = endRaw
					? parseInt(endRaw, 10)
					: Math.min(start + chunkSize, stats.size - 1);

				resp.headers[
					"Content-Range"
				] = `bytes ${start}-${end}/${stats.size}`;
				resp.headers["Accept-Ranges"] = "bytes";
				resp.headers["Content-Length"] = end - start + 1;

				resp.statusCode = 206;
				resp.data = fs.createReadStream(path, { start, end });
			} else {
				resp.headers["Content-Length"] = stats.size;

				resp.statusCode = 200;
				resp.data = fs.createReadStream(path);
			}

			console.log("Streaming Local File: ", resp);

			return resp;
		},
		POST: (url, req) => {
			console.log(req.body);
		},
	},
};
