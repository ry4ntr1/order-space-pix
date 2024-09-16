const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
	app.use(
		"/tiles",
		createProxyMiddleware({
			target: "http://albedo-sim-data.s3-website-us-west-2.amazonaws.com",
			changeOrigin: true,
			pathRewrite: {
				"^/tiles": "/tiles",
			},
			onProxyRes: function (proxyRes, req, res) {
				proxyRes.headers["Access-Control-Allow-Origin"] = "*";
			},
		})
	);
};
