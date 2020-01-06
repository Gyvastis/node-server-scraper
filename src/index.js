const Koa = require('koa');
const koaResponseTime = require('koa-response-time');
const koaLogger = require('koa-logger');
const koaCompress = require('koa-compress');
const koaJson = require('koa-json');
// const koaCash = require('koa-cash');
const _ = require('koa-route');

const searchDomain = require('./search');

const app = new Koa();
const PORT = 3000;

// app.use(koaCash());
app.use(koaResponseTime());
app.use(koaLogger());
app.use(koaJson());
// app.use(koaCompress({
//   threshold: 2048,
//   flush: require('zlib').Z_SYNC_FLUSH
// }));

app.use(_.get('/:domain', async (ctx, domain) => {
  const results = await searchDomain(domain);

  ctx.body = results.filter(result => !(result instanceof Error));
}));

app.use(_.get('/:domain/:provider', async (ctx, domain, provider) => {
  const results = await searchDomain(domain);

  ctx.body = results.filter(result => !(result instanceof Error));
}));

app.listen(PORT);
